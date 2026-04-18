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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
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
  storage: path.join(__dirname, '..', 'job_platform.sqlite'), // Dedicated DB for project focus
  logging: false
});

const admZip = require('adm-zip');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

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
    // Add missing columns manually to bypass sync limitations on SQLite
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
      }
    } catch (e) { console.error(`⚠️ Elite ${elite.name} skip:`, e.message); }
  }

  // 3. Seed Mock Clients
  try {
    const clientsExist = await Client.findOne();
    if (!clientsExist && demoUserId) {
      await Client.bulkCreate([
        { name: "Global Vertex", projectsPosted: 142, budgetSpent: 8500000, rating: 4.9, status: 'Active', userId: demoUserId },
        { name: "CyberLayer Labs", projectsPosted: 67, budgetSpent: 4200000, rating: 4.8, status: 'Active', userId: demoUserId },
        { name: "MetaNode Group", projectsPosted: 34, budgetSpent: 2100000, rating: 4.7, status: 'Active', userId: demoUserId },
        { name: "Vortex Systems", projectsPosted: 210, budgetSpent: 12500000, rating: 5.0, status: 'Active', userId: demoUserId }
      ]);
      console.log('✅ Clients synchronized');
    }
  } catch (e) { console.error('⚠️ Client Seed failed:', e.message); }

  // 4. Seed Opportunities
  try {
    const oppCount = await Opportunity.count();
    // Only seed if empty or missing required columns in first record
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

// Sync State
sequelize.sync().then(async () => {
  console.log('Database Intelligence Synchronized!');
  await repairSchema();
  await seedDatabase();
}).catch(err => {
  console.error('CRITICAL: Database Synchronization Failed:', err);
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

// Application Intelligence Engine
app.post('/api/applications', authenticate, async (req, res) => {
  const { opportunityId } = req.body;
  try {
    const user = await User.findByPk(req.userId);
    const opp = await Opportunity.findByPk(opportunityId);
    
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    console.log(`--- RECRUITMENT PROCESSING: User ${user.email} -> Opp ${opp.title} (${opp.score}%) ---`);

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

          <p style="font-size: 14px; color: #777; margin-top: 40px; border-top: 1px solid #eee; pt-20px;">
            Transmitted via AgentOS Autonomous Recruitment Engine.
          </p>
        </div>
      `;
    } else {
      // Rejection / Feedback Flow
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
        </div>
      `;
    }

    const mailOptions = {
      from: `"AgentOS Recruitment" <${process.env.EMAIL}>`,
      to: user.email,
      subject: isSelected ? `Selection Confirmation: ${opp.title}` : `Application Update: ${opp.title}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Mail Dispatched to ${user.email}`);

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

// API Routes
// ...
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
    console.error('Registration Error:', err);
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
      // Auto-seed some clients for a new user if none exist
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
      path.join(process.cwd(), 'sanskar', 'data', 'opportunities.json'),
      path.join(process.cwd(), 'backend', 'sanskar', 'data', 'opportunities.json'),
      'c:\\Users\\sanskar jagdish\\OneDrive\\Desktop\\summerhacks\\backend\\sanskar\\data\\opportunities.json'
    ];

    let filePath = null;
    console.log('--- MARKET RADAR DATA SYNC ---');
    for (const p of pathsToTry) {
      const exists = fs.existsSync(p);
      console.log(`Path [${exists ? 'FOUND' : 'MISSING'}]: ${p}`);
      if (exists) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      console.warn('⚠️ All JSON paths failed. Falling back to DB Intelligence.');
      const opps = await Opportunity.findAll({ limit: 50 });
      return res.json(opps);
    }

    console.log('✅ Synchronized with live signal source.');
    const data = fs.readFileSync(filePath, 'utf8');
    const rawOpps = JSON.parse(data);
    console.log(`✅ Volume: ${rawOpps.length} items.`);

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

// AI Opportunity Intelligence Engine
app.post('/api/opportunities/generate', authenticate, async (req, res) => {
  const { role, skills, location } = req.body;
  
  const fallbackOpps = [
    { title: `${role} Needed`, company: "Local Connect", description: `Experienced ${role} required for immediate start in ${location}.`, tags: skills, rate: "₹15,000/mo", location, time: "1h ago", score: 92 },
    { title: `Premium ${role} Role`, company: "Elite Services", description: `High-end placement for skilled ${role} professional.`, tags: skills, rate: "₹18,000/mo", location, time: "4h ago", score: 88 },
    { title: `${role} - Flexible Hours`, company: "Urban Assist", description: `Part-time or full-time ${role} needed. Skills: ${skills.join(', ')}.`, tags: skills, rate: "₹12,000/mo", location, time: "6h ago", score: 85 }
  ];

  if (!genAI) {
    console.log('Gemini API key missing, using fallback engine.');
    return res.json(fallbackOpps.map(o => ({ ...o, score: Math.min(95, o.score + Math.floor(Math.random() * 5)) })));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Generate 5 realistic job opportunities for a person with the following profile:
      Role: ${role}
      Skills: ${skills.join(', ')}
      Location: ${location}

      Return ONLY a valid JSON array of objects. Each object must have:
      - title
      - company
      - description (1-2 lines)
      - tags (array of 3 skills)
      - rate (realistic pay in ₹ or $)
      - location
      - time (e.g. "2h ago")
      - score (integer 70-95)

      Output ONLY JSON. No markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Cleanup AI markdown if present
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
    
    const aiOpps = JSON.parse(text);
    res.json(aiOpps.map(o => ({ ...o, score: Math.min(95, (o.score || 80) + Math.floor(Math.random() * 5)) })));
  } catch (error) {
    console.error('AI Generation Error:', error);
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

// AI Proposal Generator Endpoint
app.post('/api/proposals/generate', authenticate, async (req, res) => {
  const { jobTitle, jobDescription, tags, tone } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'AI Service currently offline' });
  }

  try {
    const user = await User.findByPk(req.userId);
    const profile = JSON.parse(user.profile || '{}');
    
    // Using the exact pattern that works for opportunities
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are the AgentOS Proposal Architect. 
      Generate a persuasive project proposal based on these details:
      
      JOB: ${jobTitle}
      DESCRIPTION: ${jobDescription}
      TAGS: ${tags.join(", ")}
      TONE: ${tone}
      
      SIGNATURE DETAILS (FREELANCER PROFILE):
      Name: ${user.name}
      Email: ${user.email}
      Phone: ${profile.phone || "+91 98765 43210"}
      Location: ${profile.location || "Mumbai, India"}
      Bio: ${profile.bio || "Full-stack architectural specialist."}
      Skills: ${profile.skills ? (Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills) : "React, TypeScript, Node.js"}
      
      Output the proposal in clean, professional Markdown. Be concise but impactful.`;

    let proposalText;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      proposalText = response.text();
    } catch (aiError) {
      console.error('AI Proposal Generation Failed, using fallback:', aiError.message);
      proposalText = `# Proposal: ${jobTitle}\n\nDear Client,\n\nI am excited to submit my interest for this position. With my background in ${profile.skills ? (Array.isArray(profile.skills) ? profile.skills[0] : profile.skills.split(",")[0]) : "software development"}, I am confident I can deliver high-quality results.\n\nBest regards,\n${user.name}`;
    }
    
    res.json({ text: proposalText });
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate proposal: ' + error.message });
  }
});

// AI Code Audit Endpoint (Assessment IQ)
app.post('/api/audit', async (req, res) => {
  const { code } = req.body;
  
  if (!process.env.GEMINI_API_KEY || !genAI) {
    return res.status(503).json({ error: 'AI Audit Service offline' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are a Senior Technical Architect and Security Auditor. 
      Analyze the following source code for security, logic density, redundancy, and overall quality.
      
      CODE:
      ${code}
      
      Return ONLY a valid JSON object with this exact structure:
      {
        "score": "string (0.0 to 10.0)",
        "metrics": {
          "logicDensity": { "label": "Logic Density", "passed": boolean },
          "security": { "label": "Security Compliance", "passed": boolean },
          "unitTest": { "label": "Unit Test Readiness", "passed": boolean },
          "redundancy": { "label": "Redundancy Check", "passed": boolean }
        },
        "painPoints": ["array of 5 string detailed technical criticisms or improvements"]
      }
      
      Output ONLY JSON. No markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Cleanup AI markdown if present
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
    
    const auditResults = JSON.parse(text);
    res.json(auditResults);
  } catch (error) {
    console.error('AI Audit Error:', error.message);
    // Fallback heuristic data
    res.json({
      score: "7.2",
      source: "fallback",
      metrics: {
        logicDensity: { label: 'Logic Density', passed: true },
        security: { label: 'Security Compliance', passed: true },
        unitTest: { label: 'Unit Test Readiness', passed: false },
        redundancy: { label: 'Redundancy Check', passed: true }
      },
      painPoints: [
        "Potential complex execution paths detected in core logic",
        "Limited error handling in asynchronous operations",
        "Higher than average cyclomatic complexity",
        "Missing explicit type guards for edge case inputs",
        "Optimization possible for repeated state transformations"
      ]
    });
  }
});
app.post('/api/clients/:id/deliverable', authenticate, upload.single('file'), async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Partner not found' });
    if (!req.file) return res.status(400).json({ error: 'Digital deliverable missing (ZIP required)' });

    console.log(`--- ANALYSIS INITIATED: ${client.name} ---`);
    const zip = new admZip(req.file.path);
    const zipEntries = zip.getEntries();
    
    let issues = [];
    let securityFlags = 0;
    let totalLines = 0;
    let complexityScore = 0;

    zipEntries.forEach(entry => {
      if (!entry.isDirectory && (entry.entryName.endsWith('.js') || entry.entryName.endsWith('.ts') || entry.entryName.endsWith('.tsx'))) {
        const content = entry.getData().toString('utf8');
        const lines = content.split('\n');
        totalLines += lines.length;

        // Security Scan
        if (content.includes('eval(')) securityFlags++;
        if (content.includes('dangerouslySetInnerHTML')) securityFlags++;
        if (content.includes('innerHTML')) securityFlags++;

        // Quality Scan
        if (content.includes('TODO:')) issues.push(`Found pending TODO in ${entry.entryName}`);
        if (content.includes('FIXME:')) issues.push(`Unresolved technical debt (FIXME) in ${entry.entryName}`);
        
        // Complexity check (Simplified)
        const nestedLoops = (content.match(/for.*\{.*for/g) || []).length;
        if (nestedLoops > 0) complexityScore += nestedLoops;
      }
    });

    const score = Math.max(0, 100 - (securityFlags * 10) - (issues.length * 2) - (complexityScore * 5));
    
    const report = {
      score,
      issues_found: issues.length,
      security_flags: securityFlags,
      readability: score > 80 ? "Excellent" : score > 60 ? "Good" : "Needs Review",
      suggestions: issues.slice(0, 5),
      timestamp: new Date().toISOString()
    };

    // Generate Human-Readable Trust Summary via Gemini
    let trustSummary = "Analysis complete. Deliverable is structurally sound.";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Based on this code analysis report for client "${client.name}": ${JSON.stringify(report)}. 
      Generate a 2-sentence professional, high-trust summary for the client explaining the quality or if there's any risk. 
      Tone: Senior Systems Engineer. Include the percentage score.`;
      const result = await model.generateContent(prompt);
      trustSummary = result.response.text();
    }

    await client.update({
      projectStatus: 'Submitted',
      qualityReport: { ...report, trustSummary }
    });

    res.json({ success: true, report: { ...report, trustSummary } });
  } catch (error) {
    console.error('--- ANALYSIS PIPELINE CRITICAL FAILURE ---', error);
    res.status(500).json({ error: 'Analysis engine failed to process signal' });
  }
});

app.post('/api/clients/:id/follow-up', authenticate, async (req, res) => {
  // Mock follow-up success
  res.json({ success: true, message: '✅ Follow-up sent effectively' });
});

app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const clients = await Client.findAll({ 
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    const proposals = await Proposal.findAll({ 
      where: { userId: req.userId },
      order: [['updatedAt', 'DESC']]
    });
    const opportunitiesCount = await Opportunity.count();
    const recentOpps = await Opportunity.findAll({ limit: 2, order: [['createdAt', 'DESC']] });
    
    const totalRevenue = clients.reduce((acc, c) => acc + (c.totalValue || 0), 0);
    const revenueAtRisk = clients.reduce((acc, c) => {
      if (c.riskLevel === 'High' || c.riskLevel === 'Critical') return acc + (c.pendingPayment || 0);
      return acc;
    }, 0);
    
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const pendingActions = proposals.filter(p => p.status === 'Draft' || p.status === 'Sent').length;

    // --- Dynamic Agent Logs Generation ---
    const logs = [];
    
    // Proposal logs
    if (proposals.length > 0) {
      logs.push({ 
        agent: "Ops Agent", 
        msg: `Proposal for "${proposals[0].clientName}" updated to ${proposals[0].status}`, 
        time: "Just now" 
      });
    }
    
    // Client logs
    if (clients.length > 0) {
      logs.push({ 
        agent: "Comms Agent", 
        msg: `Analyzing relationship health for ${clients[0].name}`, 
        time: "2m ago" 
      });
    }

    // Opportunity logs
    if (recentOpps.length > 0) {
      logs.push({ 
        agent: "Lead Scout", 
        msg: `Detected high-yield opportunity: ${recentOpps[0].title}`, 
        time: "15m ago" 
      });
    }

    // Agent Status heuristics
    const agents = [
      { name: "Ops Agent", status: pendingActions > 5 ? "High Load" : "Active" },
      { name: "Lead Scout", status: "Scanning…" },
      { name: "Trend Radar", status: "Monitoring" },
      { name: "Comms Agent", status: "Ready" }
    ];
    
    res.json({
      totalRevenue: `₹${(totalRevenue * 82).toLocaleString()}`,
      revenueAtRisk: `₹${(revenueAtRisk * 82).toLocaleString()}`,
      projectedProfit: `₹${((totalRevenue * 82) + (opportunitiesCount * 1500)).toLocaleString()}`,
      activeClients: activeClients.toString(),
      pendingActions: pendingActions.toString(),
      opportunities: opportunitiesCount.toString(),
      agentLogs: logs,
      agents
    });
  } catch (error) {
    res.status(500).json({ error: 'Stats retrieval failed' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const freelancers = await User.findAll({
      include: [{ model: Profile, as: 'profile', required: true }],
      limit: 30
    });

    const clients = await Client.findAll({
      limit: 10,
      order: [['budgetSpent', 'DESC']]
    });

    const mappedFreelancers = freelancers
      .map(f => {
        const rating = f.profile?.rating || 4.5;
        const jobs = f.profile?.completedJobs || 0;
        const skillsCount = f.profile?.skills ? f.profile.skills.length : 0;
        // Global ranking score: Rating weighted with volume and skill density
        const globalScore = (rating * 50) + (jobs * 2) + (skillsCount * 5);
        
        return {
          id: f.id,
          name: f.name,
          email: f.email,
          skills: f.profile?.skills || [],
          rating: rating,
          completedJobs: jobs,
          globalScore,
          status: rating >= 4.9 ? "Elite" : "Pro"
        };
      })
      .sort((a, b) => b.globalScore - a.globalScore);

    res.json({ freelancers: mappedFreelancers, clients });
  } catch (error) {
    console.error('Leaderboard Failure:', error);
    res.status(500).json({ error: 'Failed to fetch the Hall of Fame' });
  }
});

app.get('/api/proposals', authenticate, async (req, res) => {
  let proposals = await Proposal.findAll({ where: { userId: req.userId } });
  if (proposals.length === 0) {
      await Proposal.bulkCreate([
          { userId: req.userId, title: "SaaS Onboarding Flow", clientName: "Mariposa Inc.", value: 4500, status: "Draft" },
          { userId: req.userId, title: "Mobile App Audit", clientName: "Northwind Co.", value: 1200, status: "Sent" }
      ]);
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

app.post('/api/proposals/refine', authenticate, async (req, res) => {
  const { text, tone } = req.body;
  if (!genAI) return res.status(503).json({ error: 'AI engine unavailable' });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Rewrite this business proposal draft to be more ${tone || 'Professional'}. 
    Keep the core message but tighten the copy and make it more persuasive.
    Return ONLY the rewritten text.
    
    Draft:
    ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ text: response.text().trim() });
  } catch (error) {
    res.status(500).json({ error: 'Refinement failed' });
  }
});

app.delete('/api/clients/:id', authenticate, async (req, res) => {
  const client = await Client.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  await client.destroy();
  res.json({ success: true });
});

app.post('/api/ai/analyze-business', authenticate, async (req, res) => {
  if (!genAI) return res.status(503).json({ error: 'AI engine unavailable' });

  try {
    const user = await User.findByPk(req.userId, {
      include: [
        { model: Profile, as: 'profile' },
        { model: Client, as: 'clients' },
        { model: Proposal, as: 'proposals' }
      ]
    });

    const context = {
      profile: user.profile,
      clients: user.clients.map(c => ({ 
        name: c.name, 
        status: c.status, 
        projectStatus: c.projectStatus,
        pendingPayment: c.pendingPayment,
        healthScore: c.healthScore,
        riskLevel: c.riskLevel
      })),
      proposals: user.proposals.map(p => ({ title: p.title, status: p.status, value: p.value, clientName: p.clientName }))
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are the AgentOS Autonomous Operating System.
      Analyze this freelancer's data. You MUST detect risks, predict loss, and suggest actions.
      
      DATA: ${JSON.stringify(context)}
      
      CRITICAL INSTRUCTIONS:
      1. SHOCK ALERT: Always calculate the financial loss if the freelancer fails to act.
      2. LEARNING BEHAVIOR: Analyze past patterns (simulated if data is low) to show when they usually lose deals.
      3. REVENUE AT RISK: Sum total pending payments from high-risk clients.
      
      STRICT JSON OUTPUT:
      {
        "risk_level": "Low | Medium | High | Critical",
        "reason": "Direct reason based on signals",
        "revenue_at_risk": "₹ amount",
        "shock_alert": "If no action is taken, this freelancer will likely lose ₹X in the next 48 hours.",
        "learning_insight": "e.g., Based on trends, you lose 70% of deals after 5 days of silence.",
        "recommended_action": "Sharp, actionable one-liner",
        "auto_message": "A hyper-professional follow-up message",
        "confidence_score": 85,
        "show_tech_flash": true
      }
      Respond ONLY with valid JSON.`;

    let analysisData;
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
      analysisData = JSON.parse(text);
    } catch (aiError) {
      console.error('AI Command Centre Analysis Failed, using fallback:', aiError.message);
      analysisData = {
        risk_level: "Medium",
        reason: "Detected relationship drift in 2 active contracts.",
        revenue_at_risk: "₹82,000",
        shock_alert: "If no action is taken, this freelancer will likely lose ₹82,000 in the next 48 hours.",
        learning_insight: "Based on trends, you lose 70% of deals after 5 days of silence.",
        recommended_action: "Execute priority follow-up for the MetaScale project.",
        auto_message: "Hi, I'm checking in on our technical roadmap and pending deliverables to ensure everything is on track.",
        confidence_score: 92,
        show_tech_flash: true
      };
    }
    
    res.json({ ...analysisData, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Command Centre Analysis Failure:', error);
    res.status(500).json({ error: 'Critical failure in intelligence engine' });
  }
});

app.post('/api/send-email', authenticate, async (req, res) => {
  const { to, subject, message, proposalId } = req.body;
  
  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const user = await User.findByPk(req.userId);
    const recipientEmail = to || user.email; // AI-forced: Respect 'to' if provided, else self-send

    console.log(`--- ATTEMPTING DISPATCH ---`);
    console.log(`From: ${process.env.EMAIL}`);
    console.log(`To: ${recipientEmail}`);

    const mailOptions = {
      from: `"AgentOS Intelligence" <${process.env.EMAIL}>`,
      to: recipientEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">AgentOS Proposal</h2>
          <div style="white-space: pre-wrap; color: #333; line-height: 1.6;">${message}</div>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">Sent via <a href="#" style="color: #6366f1;">AgentOS</a> — Autonomous Business Operating System</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ SMTP SUCCESS:', info.messageId);
    
    if (proposalId) {
      const proposal = await Proposal.findOne({ where: { id: proposalId, userId: req.userId } });
      if (proposal) await proposal.update({ status: 'Sent' });
    }

    res.json({ success: true, feedback: '✅ Proposal sent successfully' });
  } catch (error) {
    console.error('--- SMTP CRITICAL FAILURE ---');
    console.error('Error Msg:', error.message);
    res.status(500).json({ error: `Email failed: ${error.message}` });
  }
});

// --- AI JOB MATCHING PLATFORM EXTENSIONS ---

// Mock Google Auth
app.post('/api/auth/google', async (req, res) => {
  const { email, name, googleId } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      // Create a dummy password for oauth users
      const hashedPassword = await bcrypt.hash(uuidv4(), 10);
      user = await User.create({ email, name, password: hashedPassword });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// AI Profile Analysis
app.post('/api/analyze-profile', authenticate, async (req, res) => {
  if (!genAI) return res.status(503).json({ error: 'AI engine unavailable' });
  try {
    const profile = await Profile.findOne({ where: { userId: req.userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `You are a Senior Talent Scout. Analyze this freelancer profile:
      Skills: ${JSON.stringify(profile.skills)}
      Experience: ${profile.yearsOfExperience} years, ${profile.experienceLevel}
      Bio: ${profile.bio}
      
      Generate a professional analysis in JSON format:
      {
        "top_skills": ["skill1", "skill2"],
        "strengths": ["strength1", "strength2"],
        "suggested_roles": ["role1", "role2"],
        "matching_strategy": "Keywords to look for in job descriptions"
      }
      Respond ONLY with valid JSON.`;

    let analysis;
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
      analysis = JSON.parse(text);
    } catch (aiError) {
      console.error('AI Analysis API Failed, using fallback:', aiError.message);
      analysis = {
        top_skills: profile.skills.length > 0 ? profile.skills : ["React", "JavaScript"],
        strengths: ["Strong technical core", "Adaptability"],
        suggested_roles: ["Fullstack Developer", "Frontend Lead"],
        matching_strategy: "Focus on UI/UX and React ecosystem roles."
      };
    }
    
    await profile.update({ analysisResults: analysis });
    res.json(analysis);
  } catch (error) {
    console.error('Profile Analysis failed:', error);
    res.status(500).json({ error: 'Analysis engine failed' });
  }
});

// Job Matching System
app.get('/api/jobs/matches', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.userId } });
    if (!profile || !profile.analysisResults) {
      // Fallback: return any 5 jobs
      const jobs = await Opportunity.findAll({ limit: 5 });
      return res.json(jobs);
    }

    const { suggested_roles, top_skills } = profile.analysisResults;
    
    // Simple heuristic: search for any of the suggested roles or skills in titles/tags
    const jobs = await Opportunity.findAll({
      where: {
        [Op.or]: [
          ...suggested_roles.map(role => ({ title: { [Op.like]: `%${role}%` } })),
          ...top_skills.map(skill => ({ tags: { [Op.like]: `%${skill}%` } }))
        ]
      },
      limit: 10
    });

    // If no specific matches, return default recommendations
    if (jobs.length === 0) {
      return res.json(await Opportunity.findAll({ limit: 5 }));
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Matching engine failure' });
  }
});

// End of routing

app.listen(PORT, () => console.log(`Sanskar Backend running on port ${PORT}`));
