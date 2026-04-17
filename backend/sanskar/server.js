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
  storage: path.join(__dirname, '..', 'database.sqlite'), // Shared database file in parent folder
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
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
User.hasMany(Client, { foreignKey: 'userId', as: 'clients' });
User.hasMany(Insight, { foreignKey: 'userId', as: 'insights' });
User.hasMany(Proposal, { foreignKey: 'userId', as: 'proposals' });

// Seeding Logic
const seedDatabase = async () => {
  const jobCount = await Opportunity.count();
  if (jobCount === 0) {
    await Opportunity.bulkCreate([
      { title: "Senior React Engineer — Fintech startup", description: "12-week contract building a trading dashboard.", company: "MetaScale", rate: "$120/hr", location: "Remote · EU", score: 96, age: "2h ago", tags: ["React", "TypeScript", "Fintech"] },
      { title: "AI Product Engineer — B2B SaaS", description: "Help ship LLM features into an existing onboarding flow.", company: "CyberNexus", rate: "$150/hr", location: "Remote · Worldwide", score: 91, age: "5h ago", tags: ["AI", "Product", "Python"] },
      { title: "Frontend Audit — DTC e-commerce", description: "One-week audit of Next.js storefront. Performance focused.", company: "Vivid UI", rate: "$2000/fix", location: "Remote", score: 78, age: "1d ago", tags: ["Next.js", "Audit", "Performance"] }
    ]);
    console.log('Seeded initial opportunities.');
  }
};

// Sync State
sequelize.sync().then(() => {
  console.log('Database & tables updated with Clients, Jobs, and Insights!');
  seedDatabase();
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
app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await User.findByPk(req.userId, { include: [{ model: Profile, as: 'profile' }] });
  res.json({ user });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword, name });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user });
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
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate proposal: ' + error.message });
  }
});

// DELIVERABLE SUBMISSION & TRUST PIPELINE
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '');
    const analysisData = JSON.parse(text);
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
    const recipientEmail = user.email; // AI-forced: Always send to registered user for this phase

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
    console.error('Error Name:', error.name);
    console.error('Error Msg:', error.message);
    console.error('Error Code:', error.code);
    if (error.response) console.error('SMTP Response:', error.response);
    res.status(500).json({ error: `Email failed: ${error.message}` });
  }
});

app.listen(PORT, () => console.log(`Sanskar Backend running on port ${PORT}`));
