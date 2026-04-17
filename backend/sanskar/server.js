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
  totalValue: { type: DataTypes.FLOAT, defaultValue: 0 },
  email: DataTypes.STRING
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
      label: o.type === 'freelance' ? "🔥 Freelance" : "🏢 Agency"
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

app.get('/api/stats', authenticate, async (req, res) => {
  const clients = await Client.findAll({ where: { userId: req.userId } });
  const proposals = await Proposal.findAll({ where: { userId: req.userId } });
  const opportunities = await Opportunity.count();
  
  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalValue || 0), 0);
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const pendingActions = proposals.filter(p => p.status === 'Draft' || p.status === 'Sent').length;
  
  res.json({
    totalRevenue: `₹${(totalRevenue * 82).toLocaleString()}`, // Mock conversion to INR
    projectedProfit: `₹${((totalRevenue * 82) + (opportunities * 1500)).toLocaleString()}`,
    activeClients: activeClients.toString(),
    pendingActions: pendingActions.toString(),
    opportunities: opportunities.toString()
  });
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
