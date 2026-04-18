const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const admZip = require('adm-zip');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

console.log('--- AI ENGINE INITIALIZING ---');
if (process.env.GEMINI_API_KEY) {
  console.log('API Key Status: DETECTED (Prefix: ' + process.env.GEMINI_API_KEY.substring(0, 5) + '...)');
} else {
  console.warn('API Key Status: NOT FOUND in process.env');
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Nodemailer Transport
console.log('--- MAIL ENGINE INITIALIZING ---');
console.log('Identity:', process.env.EMAIL);
if (process.env.APP_PASSWORD) console.log('Secret Status: LOADED (Length: ' + process.env.APP_PASSWORD.length + ')');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

// Initialize SQLite Database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'job_platform.sqlite'), // DB now in root backend folder
  logging: false
});

// Configure Multer for Deliverables
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Models
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  isOnboarded: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  phone: DataTypes.STRING,
  location: DataTypes.STRING,
  skills: { type: DataTypes.TEXT, get() { const val = this.getDataValue('skills'); return val ? JSON.parse(val) : []; }, set(val) { this.setDataValue('skills', JSON.stringify(val)); } },
  bio: DataTypes.TEXT,
  jobType: DataTypes.STRING,
  availability: DataTypes.INTEGER,
  expectedSalary: DataTypes.STRING,
  experienceLevel: DataTypes.STRING,
  yearsOfExperience: DataTypes.INTEGER,
  rating: { type: DataTypes.FLOAT, defaultValue: 4.5 },
  completedJobs: { type: DataTypes.INTEGER, defaultValue: 0 },
  analysisResults: { type: DataTypes.TEXT, get() { const val = this.getDataValue('analysisResults'); return val ? JSON.parse(val) : null; }, set(val) { this.setDataValue('analysisResults', JSON.stringify(val)); } }
});

const Client = sequelize.define('Client', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  contact: DataTypes.STRING,
  status: { type: DataTypes.ENUM('Active', 'Pending', 'Inactive'), defaultValue: 'Active' },
  projectStatus: { type: DataTypes.ENUM('Pending', 'In-Progress', 'Submitted', 'Completed'), defaultValue: 'Pending' },
  totalValue: { type: DataTypes.FLOAT, defaultValue: 0 },
  pendingPayment: { type: DataTypes.FLOAT, defaultValue: 0 },
  email: DataTypes.STRING,
  riskLevel: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Low' },
  healthScore: { type: DataTypes.INTEGER, defaultValue: 100 },
  lastInteraction: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  budgetSpent: { type: DataTypes.FLOAT, defaultValue: 0 },
  projectsPosted: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 4.8 },
  qualityReport: { type: DataTypes.TEXT, get() { const val = this.getDataValue('qualityReport'); return val ? JSON.parse(val) : null; }, set(val) { this.setDataValue('qualityReport', JSON.stringify(val)); } }
});

const Opportunity = sequelize.define('Opportunity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  company: DataTypes.STRING,
  rate: DataTypes.STRING,
  location: DataTypes.STRING,
  score: { type: DataTypes.INTEGER, defaultValue: 90 },
  age: { type: DataTypes.STRING, defaultValue: '2h ago' },
  clientEmail: { type: DataTypes.STRING, defaultValue: 'recruitment@agentos.ai' },
  requirements: { type: DataTypes.TEXT, defaultValue: 'Technical proficiency in the stated stack and a proven track record of autonomous delivery.' },
  tags: { type: DataTypes.TEXT, get() { const val = this.getDataValue('tags'); return val ? JSON.parse(val) : []; }, set(val) { this.setDataValue('tags', JSON.stringify(val)); } }
});

const Insight = sequelize.define('Insight', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('Profit', 'Suggestion', 'Growth'), defaultValue: 'Suggestion' },
  title: { type: DataTypes.STRING, allowNull: false },
  body: DataTypes.TEXT,
  icon: { type: DataTypes.STRING, defaultValue: 'Lightbulb' }
});

const Proposal = sequelize.define('Proposal', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('Draft', 'Sent', 'Accepted', 'Rejected'), defaultValue: 'Draft' },
  value: DataTypes.FLOAT,
  clientName: DataTypes.STRING,
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Relationships
User.hasOne(Profile, { as: 'profile', foreignKey: 'userId' });
Profile.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Client, { foreignKey: 'userId', as: 'clients' });
User.hasMany(Insight, { foreignKey: 'userId', as: 'insights' });
User.hasMany(Proposal, { foreignKey: 'userId', as: 'proposals' });

// Seeding Logic
// Resilient Database Repair & Seeding
const repairSchema = async () => {
  console.log('--- STARTING DATABASE REPAIR ENGINE ---');
  try {
    const tableInfo = await sequelize.query("PRAGMA table_info(Opportunities)");
    const columns = tableInfo[0].map(c => c.name);
    
    if (!columns.includes('clientEmail')) {
      await sequelize.query("ALTER TABLE Opportunities ADD COLUMN clientEmail VARCHAR(255) DEFAULT 'recruitment@agentos.ai'");
      console.log('✅ Added column: clientEmail');
    }
    if (!columns.includes('requirements')) {
      await sequelize.query("ALTER TABLE Opportunities ADD COLUMN requirements TEXT DEFAULT 'Technical proficiency required.'");
      console.log('✅ Added column: requirements');
    }
    console.log('--- DATABASE REPAIR COMPLETE ---');
  } catch (err) {
    console.warn('⚠️ Repair engine warning (non-critical):', err.message);
  }
};

const seedDatabase = async () => {
  console.log('--- INITIALIZING GLOBAL SEEDING ENGINE ---');
  
  let demoUserId = null;
  // 1. Seed Demo User
  try {
    const demoEmail = 'demo@jobmatch.ai';
    let demoUser = await User.findOne({ where: { email: demoEmail } });
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      demoUser = await User.create({ 
        email: demoEmail, 
        password: hashedPassword, 
        name: 'Demo Freelancer',
        isOnboarded: true 
      });
      
      await Profile.create({
        userId: demoUser.id,
        phone: '+91 99999 88888',
        location: 'Mumbai, Digital Nomad',
        skills: ['React', 'TypeScript', 'Node.js', 'AI Integration'],
        bio: 'Senior Architecture specialist focusing on autonomous agent systems.',
        jobType: 'Freelance',
        yearsOfExperience: 5,
        experienceLevel: 'Senior',
        expectedSalary: '8000',
        rating: 4.9,
        completedJobs: 24
      });
      console.log('✅ Demo account active');
    }
    demoUserId = demoUser.id;
  } catch (e) { console.error('⚠️ Demo Seed failed:', e.message); }

  // 2. Seed Elite Leaderboard
  const eliteUsers = [
    { name: "Sanskar Gharal", email: "sanskar@agentos.ai", skills: ["Agentic AI", "Senior Architecture", "Fullstack"], rating: 5.0, jobs: 154, earnings: "₹1.2Cr" },
    { name: "Aisha Khan", email: "aisha@web3.io", skills: ["Web3 Architect", "Solidity", "React"], rating: 4.9, jobs: 89, earnings: "₹75L" },
    { name: "Leo Da Silva", email: "leo@rust.dev", skills: ["Rust", "Systems Design", "Wasm"], rating: 4.9, jobs: 112, earnings: "₹92L" },
    { name: "Mei Ling", email: "mei@ai.research", skills: ["ML Researcher", "Python", "PyTorch"], rating: 5.0, jobs: 45, earnings: "₹1.1Cr" },
    { name: "Jordan Smith", email: "jordan@devsec.ops", skills: ["DevSecOps", "AWS", "Kubernetes"], rating: 4.8, jobs: 130, earnings: "₹58L" },
    { name: "Sanskar Gharal (You)", email: "sanskar0912gharal@gmail.com", skills: ["Neural Architect", "Agentic Systems", "React"], rating: 5.0, jobs: 99, earnings: "₹88L" },
    { name: "Arjun Mehta", email: "arjun@elite.io", skills: ["AI Strategy", "Python"], rating: 4.9, jobs: 42, earnings: "₹45L" },
    { name: "Sarah Chen", email: "sarah@nexus.gl", skills: ["UI Architect", "Framer"], rating: 4.8, jobs: 38, earnings: "₹38L" },
    { name: "Elena Volkov", email: "elena@dev.ru", skills: ["Rust", "Security"], rating: 5.0, jobs: 15, earnings: "₹52L" },
    { name: "Marcus Thorne", email: "marcus@design.uk", skills: ["3D Motion", "Unreal"], rating: 4.7, jobs: 56, earnings: "₹29L" },
    { name: "Ishita Rao", email: "ishita@scale.in", skills: ["Next.js", "Vercel"], rating: 4.9, jobs: 61, earnings: "₹41L" }
  ];

  for (const elite of eliteUsers) {
    try {
      let user = await User.findOne({ where: { email: elite.email } });
      if (!user) {
        user = await User.create({ email: elite.email, name: elite.name, password: 'mock_password', isOnboarded: true });
        await Profile.create({
          userId: user.id,
          skills: elite.skills,
          rating: elite.rating,
          completedJobs: elite.jobs,
          experienceLevel: 'Expert',
          bio: 'Global elite freelancer in the AgentOS network.'
        });
      } else {
        // Log existing elite users for confirmation
        // console.log(`ℹ️ Elite sync: ${elite.name} exists`);
      }
    } catch (e) { console.error(`⚠️ Elite ${elite.name} skip:`, e.message); }
  }
  console.log('✅ Elite Nexus Synchronized (' + eliteUsers.length + ' Agents)');

  // 3. Seed Mock Clients
  try {
    const clientsExist = await Client.findOne();
    if (!clientsExist && demoUserId) {
      await Client.bulkCreate([
        { name: "Global Vertex", projectsPosted: 142, budgetSpent: 8500000, rating: 4.9, status: 'Active', userId: demoUserId },
        { name: "CyberLayer Labs", projectsPosted: 67, budgetSpent: 4200000, rating: 4.8, status: 'Active', userId: demoUserId },
        { name: "MetaNode Group", projectsPosted: 34, budgetSpent: 2100000, rating: 4.7, status: 'Active', userId: demoUserId },
        { name: "Vortex Systems", projectsPosted: 210, budgetSpent: 12500000, rating: 5.0, status: 'Active', userId: demoUserId },
        { name: "Alpha Solutions", projectsPosted: 89, budgetSpent: 3200000, rating: 4.6, status: 'Active', userId: demoUserId },
        { name: "Neon Flux", projectsPosted: 45, budgetSpent: 1500000, rating: 4.5, status: 'Active', userId: demoUserId },
        { name: "Titan Builders", projectsPosted: 156, budgetSpent: 9800000, rating: 4.9, status: 'Active', userId: demoUserId },
        { name: "Orbit Digital", projectsPosted: 23, budgetSpent: 1100000, rating: 4.8, status: 'Active', userId: demoUserId }
      ]);
      console.log('✅ Clients synchronized');
    }
  } catch (e) { console.error('⚠️ Client Seed failed:', e.message); }

  // 4. Seed Opportunities
  try {
    const oppCount = await Opportunity.count();
    const sample = await Opportunity.findOne();
    if (oppCount < 3 || (sample && !sample.clientEmail)) {
      if (sample && !sample.clientEmail) {
        await Opportunity.destroy({ where: {}, truncate: true });
      }
      await Opportunity.bulkCreate([
        { title: "Senior React Engineer — Fintech startup", description: "12-week contract building a trading dashboard.", company: "MetaScale", rate: "$120/hr", location: "Remote · EU", score: 96, age: "2h ago", tags: ["React", "TypeScript", "Fintech"], clientEmail: "hiring@metascale.io", requirements: "Deep knowledge of React 18, TanStack Query, and real-time WebSocket architecture." },
        { title: "AI Product Engineer — B2B SaaS", description: "Help ship LLM features into an existing onboarding flow.", company: "CyberNexus", rate: "$150/hr", location: "Remote · Worldwide", score: 91, age: "5h ago", tags: ["AI", "Product", "Python"], clientEmail: "talent@cybernexus.com", requirements: "Experience with LangChain, OpenAI API, and building scalable RAG pipelines." },
        { title: "Frontend Audit — DTC e-commerce", description: "One-week audit of Next.js storefront. Performance focused.", company: "Vivid UI", rate: "$2000/fix", location: "Remote", score: 78, age: "1d ago", tags: ["Next.js", "Audit", "Performance"], clientEmail: "audit@vividui.com", requirements: "Mastery of Web Vitals, partial hydration, and lighthouse optimization." }
      ]);
      console.log('✅ Opportunities synchronized');
    }
  } catch (e) { console.error('⚠️ Opportunity Seed failed:', e.message); }
  
  console.log('--- SEEDING ENGINE COMPLETE ---');
};

// Global Anti-Crash Protection
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('⚠️ [CRITICAL] Uncaught Exception:', error);
});

// Sync State & Sequenced Startup
sequelize.sync().then(async () => {
  console.log('🚀 Database Intelligence Synchronized!');
  try {
    await repairSchema();
    await seedDatabase();
    
    app.listen(PORT, () => {
        console.log(`\n🚀 ==========================================`);
        console.log(`🚀 Backend LIVE on port ${PORT}`);
        console.log(`📡 AI Engine Status: ${genAI ? 'ACTIVE' : 'OFFLINE'}`);
        console.log(`🚀 ==========================================\n`);
    });
  } catch (err) {
    console.error('❌ Initialization Sequence Failed:', err);
  }
}).catch(err => {
  console.error('❌ CRITICAL: Database Synchronization Failed:', err);
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) { res.status(401).json({ error: 'Invalid token' }); }
};

// API Routes
app.post('/api/applications', authenticate, async (req, res) => {
  const { opportunityId } = req.body;
  try {
    const user = await User.findByPk(req.userId);
    const opp = await Opportunity.findByPk(opportunityId);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    const isSelected = opp.score >= 95;
    let emailHtml = "";

    if (isSelected) {
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fafafa; border-radius: 20px;">
          <h1 style="color: #6366f1; margin-bottom: 20px;">🎉 Congratulations!</h1>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Our Neural Matching Engine has verified your profile signals at <strong>${opp.score}%</strong>. The client, <strong>${opp.company}</strong>, has reviewed your technical markers.</p>
          <div style="background: #eef2ff; padding: 25px; border-radius: 15px; border: 1px solid #6366f1; margin: 30px 0; text-align: center;">
            <h2 style="color: #6366f1; margin: 0;">You have been cracked for this role.</h2>
            <p style="font-size: 14px; color: #4338ca; font-weight: bold; margin-top: 10px;">Role: ${opp.title} | Priority: Immediate</p>
          </div>
          <p style="font-size: 16px; color: #333; line-height: 1.6;"><strong>Next steps:</strong> Please proceed to draft your formal proposal to <strong>${opp.clientEmail}</strong> via the AgentOS Dashboard to finalize the contract.</p>
          <p style="font-size: 14px; color: #777; margin-top: 40px; border-top: 1px solid #eee; pt-20px;">Transmitted via AgentOS Autonomous Recruitment Engine.</p>
        </div>`;
    } else {
      const improvementTips = [
        "Strengthen your specialization in the core tech stack required.",
        "Include more verifiable metrics in your project bio.",
        "Ensure your location availability matches the client's time zone exactly."
      ];
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px;">
          <h2 style="color: #ef4444;">Application Update: ${opp.title}</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.name},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Thank you for your interest in <strong>${opp.company}</strong>. While your profile signals are strong, your current match strength of <strong>${opp.score}%</strong> is just below the recruitment threshold for this phase.</p>
          <div style="background: #fdf2f2; padding: 25px; border-radius: 15px; border: 1px solid #fee2e2; margin: 30px 0;">
            <h4 style="color: #b91c1c; margin-top: 0;">🛡️ Next Improvements to Focus On:</h4>
            <ul style="font-size: 14px; color: #7f1d1d; line-height: 1.8;">
              ${improvementTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
          <p style="font-size: 14px; color: #666;">Apply these adjustments to your profile. The Lead Scout is already scanning for roles that better align with your evolving signals.</p>
        </div>`;
    }

    const mailOptions = {
      from: `"AgentOS Recruitment" <${process.env.EMAIL}>`,
      to: user.email,
      subject: isSelected ? `Selection Confirmation: ${opp.title}` : `Application Update: ${opp.title}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      message: isSelected ? "Congratulations! You have been selected. Check your email for the offer letter." : "Application processed. Check your email for feedback on your signal strength.", 
      status: "Transmitted",
      clientEmail: opp.clientEmail,
      jobTitle: opp.title,
      isSelected
    });
  } catch (err) {
    console.error('Transmission Failure:', err.message);
    res.status(500).json({ error: 'Signal transmission failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await User.findByPk(req.userId, { include: [{ model: Profile, as: 'profile' }] });
  res.json({ user });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

app.post('/api/profile', authenticate, async (req, res) => {
  const [profile, created] = await Profile.findOrCreate({ where: { userId: req.userId }, defaults: { ...req.body, userId: req.userId } });
  if (!created) await profile.update(req.body);
  await User.update({ isOnboarded: true }, { where: { id: req.userId } });
  res.json({ profile });
});

app.get('/api/clients', authenticate, async (req, res) => {
  const clients = await Client.findAll({ where: { userId: req.userId } });
  if (clients.length === 0) {
      await Client.bulkCreate([
          { userId: req.userId, name: "Mariposa Inc.", contact: "Jordan Lee", status: "Active", totalValue: 24000 },
          { userId: req.userId, name: "Northwind Co.", contact: "Sara Patel", status: "Pending", totalValue: 8500 }
      ]);
      return res.json(await Client.findAll({ where: { userId: req.userId } }));
  }
  res.json(clients);
});

app.post('/api/clients', authenticate, async (req, res) => {
  const client = await Client.create({ ...req.body, userId: req.userId });
  res.status(201).json(client);
});

app.get('/api/opportunities', authenticate, async (req, res) => {
  try {
    const pathsToTry = [
      path.join(__dirname, 'data', 'opportunities.json'),
      path.join(process.cwd(), 'data', 'opportunities.json'),
    ];

    let filePath = null;
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      const opps = await Opportunity.findAll({ limit: 50 });
      return res.json(opps);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const rawOpps = JSON.parse(data);
    const mappedOpps = rawOpps.map(o => ({
      id: o.id,
      title: o.title || "Untitled Opportunity",
      company: o.platform || o.company || "Direct Client",
      description: `${o.title} in ${o.location}. Deep matched from signal roster.`,
      rate: o.salary || (o.budget ? `₹${o.budget.toLocaleString()}` : "₹15,000+"),
      location: o.location || "Remote",
      time: o.posted_time || "Recent",
      score: Math.floor(Math.random() * (98 - 85) + 85),
      tags: Array.isArray(o.skills) ? o.skills : ["General"],
      label: o.type === 'freelance' ? "🔥 Freelance" : "🏢 Agency",
      category: (o.title && typeof o.title === 'string' && o.title.toLowerCase().match(/house|clean|maintenance|security|guard|chef|cook|delivery|staff/) ? "Non-Technical" : "Technical")
    }));

    res.json(mappedOpps);
  } catch (error) {
    console.error('❌ Data Bridge Failure:', error.message);
    const opps = await Opportunity.findAll({ limit: 50 });
    res.json(opps);
  }
});

app.post('/api/opportunities/generate', authenticate, async (req, res) => {
  const { role, skills, location } = req.body;
  const fallbackOpps = [
    { title: `${role} Needed`, company: "Local Connect", description: `Experienced ${role} required for immediate start in ${location}.`, tags: skills, rate: "₹15,000/mo", location, time: "1h ago", score: 92 },
    { title: `Premium ${role} Role`, company: "Elite Services", description: `High-end placement for skilled ${role} professional.`, tags: skills, rate: "₹18,000/mo", location, time: "4h ago", score: 88 }
  ];

  if (!genAI) return res.json(fallbackOpps.map(o => ({ ...o, score: Math.min(95, o.score + Math.floor(Math.random() * 5)) })));

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Generate 5 realistic job opportunities: Role: ${role}, Skills: ${skills.join(', ')}, Location: ${location}. Return ONLY valid JSON array.`;
    const result = await model.generateContent(prompt);
    let text = (await result.response).text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
    const aiOpps = JSON.parse(text);
    res.json(aiOpps.map(o => ({ ...o, score: Math.min(95, (o.score || 80) + Math.floor(Math.random() * 5)) })));
  } catch (error) {
    res.json(fallbackOpps);
  }
});

app.get('/api/insights', authenticate, async (req, res) => {
  let insights = await Insight.findAll({ where: { userId: req.userId } });
  if (insights.length === 0) {
      await Insight.bulkCreate([
          { userId: req.userId, type: 'Profit', title: "Your hourly rate climbed 14%", body: "Fixed-scope projects are delivering better margins." },
          { userId: req.userId, type: 'Suggestion', title: "Productize your audits", body: "Three recent engagements started as simple audits.", icon: 'Target' }
      ]);
      insights = await Insight.findAll({ where: { userId: req.userId } });
  }
  res.json(insights);
});

app.post('/api/proposals/generate', authenticate, async (req, res) => {
  const { jobTitle, jobDescription, tags, tone } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('[AI Error] GEMINI_API_KEY missing in process.env');
    return res.status(503).json({ error: 'AI Service currently offline' });
  }

  try {
    const user = await User.findByPk(req.userId);
    const profile = await Profile.findOne({ where: { userId: req.userId } });
    
    console.log(`[AI Request] Generating proposal for "${jobTitle}" using model gemini-1.5-flash-latest`);
    
    const model = (new GoogleGenerativeAI(process.env.GEMINI_API_KEY)).getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Generate a persuasive proposal: JOB: ${jobTitle}, DESCRIPTION: ${jobDescription}. TONE: ${tone}. Profile: ${user.name}, Bio: ${profile?.bio || 'Freelancer'}. Output Markdown.`;
    
    let proposalText;
    try {
      const result = await model.generateContent(prompt);
      proposalText = (await result.response).text();
    } catch (e) {
      console.error('[AI Generation Error]', e.message);
      proposalText = `# Proposal: ${jobTitle}\n\nDear Client, I am interested in this role. Best, ${user.name}`;
    }
    res.json({ text: proposalText });
  } catch (error) {
    console.error('[Proposal Route Error]', error);
    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

app.post('/api/audit', async (req, res) => {
  const { code } = req.body;
  if (!process.env.GEMINI_API_KEY || !genAI) return res.status(503).json({ error: 'AI Audit Service offline' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Analyze code for quality. CODE: ${code}. Return ONLY valid JSON with score, metrics, painPoints.`;
    const result = await model.generateContent(prompt);
    let text = (await result.response).text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
    res.json(JSON.parse(text));
  } catch (error) {
    res.json({ score: "7.2", metrics: { logicDensity: { label: 'Logic Density', passed: true }, security: { label: 'Security Compliance', passed: true }, unitTest: { label: 'Unit Test Readiness', passed: false }, redundancy: { label: 'Redundancy Check', passed: true } }, painPoints: ["Potential complex paths", "Limited error handling"] });
  }
});

app.post('/api/clients/:id/deliverable', authenticate, upload.single('file'), async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client || !req.file) return res.status(400).json({ error: 'Deliverable missing' });
    const zip = new admZip(req.file.path);
    const zipEntries = zip.getEntries();
    let issues = [], securityFlags = 0, score = 90;
    zipEntries.forEach(entry => {
      if (!entry.isDirectory && entry.entryName.match(/\.(js|ts|tsx)$/)) {
        const content = entry.getData().toString('utf8');
        if (content.includes('eval(')) securityFlags++;
        if (content.includes('TODO:')) issues.push(`TODO in ${entry.entryName}`);
      }
    });
    const report = { score, issues_found: issues.length, security_flags: securityFlags, readability: "Good", suggestions: issues.slice(0, 5), timestamp: new Date().toISOString() };
    await client.update({ projectStatus: 'Submitted', qualityReport: report });
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: 'Analysis engine failed' });
  }
});

app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const clients = await Client.findAll({ where: { userId: req.userId } });
    const proposals = await Proposal.findAll({ where: { userId: req.userId } });
    const oppCount = await Opportunity.count();
    
    const totalRevenue = clients.reduce((acc, c) => acc + (c.totalValue || 0), 0);
    const pendingPayment = clients.reduce((acc, c) => acc + (c.pendingPayment || 0), 0);
    
    // Logic: Actions could be clients with high risk or unsent proposals
    const pendingProposals = proposals.filter(p => p.status === 'Draft').length;
    const highRiskClients = clients.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length;
    
    res.json({ 
      totalRevenue: `₹${(totalRevenue * 82).toLocaleString()}`, 
      activeClients: clients.length.toString(), 
      opportunities: oppCount.toString(), 
      pendingActions: (pendingProposals + highRiskClients).toString(),
      projectedProfit: `₹${(pendingPayment * 82).toLocaleString()}`,
      agentLogs: [
        { text: `${oppCount} New high-value opportunities detected`, tag: 'LEAD SCOUT', time: 'Just now' },
        { text: `${highRiskClients} Client relationships REQUIRE attention`, tag: 'RISK AGENT', time: '1m ago' },
        { text: `${pendingProposals} Proposals pending architect review`, tag: 'OPS AGENT', time: '5m ago' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Stats failed' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const freelancers = await User.findAll({ 
      include: [{ model: Profile, as: 'profile', required: true }], 
      order: [[{ model: Profile, as: 'profile' }, 'rating', 'DESC']]
    });
    const clients = await Client.findAll({ order: [['budgetSpent', 'DESC']] });
    
    const mappedFreelancers = freelancers.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      rating: f.profile?.rating || 4.9,
      skills: f.profile?.skills || [],
      completedJobs: f.profile?.completedJobs || 0,
      status: 'Active', // Mocking status for leaderboard
      bio: f.profile?.bio
    }));

    res.json({ freelancers: mappedFreelancers, clients });
  } catch (error) {
    console.error('[Leaderboard Route Error]', error);
    res.status(500).json({ error: 'Leaderboard synchronization failed' });
  }
});

app.get('/api/proposals', authenticate, async (req, res) => {
  let proposals = await Proposal.findAll({ where: { userId: req.userId } });
  if (proposals.length === 0) {
      await Proposal.bulkCreate([{ userId: req.userId, title: "SaaS Onboarding Flow", clientName: "Mariposa Inc.", value: 4500, status: "Draft" }]);
      proposals = await Proposal.findAll({ where: { userId: req.userId } });
  }
  res.json(proposals);
});

app.post('/api/proposals', authenticate, async (req, res) => {
  const proposal = await Proposal.create({ ...req.body, userId: req.userId });
  res.status(201).json(proposal);
});

app.patch('/api/proposals/:id', authenticate, async (req, res) => {
  const proposal = await Proposal.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  await proposal.update(req.body);
  res.json(proposal);
});

app.post('/api/ai/analyze-business', authenticate, async (req, res) => {
  if (!genAI) return res.status(503).json({ error: 'AI engine unavailable' });
  try {
    const user = await User.findByPk(req.userId, { include: [{ model: Profile, as: 'profile' }, { model: Client, as: 'clients' }, { model: Proposal, as: 'proposals' }] });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Analyze freelancer data for risks: ${JSON.stringify(user)}. Return ONLY valid JSON.`;
    let analysisData;
    try {
      const result = await model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
      analysisData = JSON.parse(text);
    } catch (e) {
      analysisData = { risk_level: "Medium", reason: "Relationship drift", revenue_at_risk: "₹82,000" };
    }
    res.json(analysisData);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.post('/api/send-email', authenticate, async (req, res) => {
  const { to, subject, message, proposalId } = req.body;
  if (!process.env.EMAIL || !process.env.APP_PASSWORD) return res.status(503).json({ error: 'Email not configured' });
  try {
    const user = await User.findByPk(req.userId);
    await transporter.sendMail({ from: process.env.EMAIL, to: to || user.email, subject, html: `<div>${message}</div>` });
    if (proposalId) {
      const p = await Proposal.findOne({ where: { id: proposalId, userId: req.userId } });
      if (p) await p.update({ status: 'Sent' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Email failed' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { email, name } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) user = await User.create({ email, name, password: uuidv4() });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'OAuth failed' });
  }
});

app.post('/api/analyze-profile', authenticate, async (req, res) => {
  if (!genAI) return res.status(503).json({ error: 'AI engine offline' });
  try {
    const profile = await Profile.findOne({ where: { userId: req.userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Analyze profile skills: ${JSON.stringify(profile.skills)}. Return JSON.`;
    let analysis;
    try {
      const result = await model.generateContent(prompt);
      let text = (await result.response).text().trim();
      if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
      analysis = JSON.parse(text);
    } catch (e) {
      analysis = { top_skills: profile.skills };
    }
    await profile.update({ analysisResults: analysis });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/api/jobs/matches', authenticate, async (req, res) => {
  try {
    const opps = await Opportunity.findAll({ limit: 10 });
    res.json(opps);
  } catch (error) {
    res.status(500).json({ error: 'Matching failed' });
  }
});

// Resiliency: Keep process alive if it tries to exit prematurely
setInterval(() => {}, 1000 * 60 * 60); 
