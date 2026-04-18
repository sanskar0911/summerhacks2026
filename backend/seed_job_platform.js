const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'job_platform.sqlite'),
  logging: false
});

// Models for seeding
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
});

const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  skills: { type: DataTypes.TEXT, get() { const val = this.getDataValue('skills'); return val ? JSON.parse(val) : []; }, set(val) { this.setDataValue('skills', JSON.stringify(val)); } },
  rating: { type: DataTypes.FLOAT, defaultValue: 4.5 },
  completedJobs: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Client = sequelize.define('Client', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  budgetSpent: { type: DataTypes.FLOAT },
  projectsPosted: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.FLOAT }
});

const Opportunity = sequelize.define('Opportunity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  company: DataTypes.STRING,
  rate: DataTypes.STRING,
  location: DataTypes.STRING,
  tags: { type: DataTypes.TEXT, get() { const val = this.getDataValue('tags'); return val ? JSON.parse(val) : []; }, set(val) { this.setDataValue('tags', JSON.stringify(val)); } }
});

const Insight = sequelize.define('Insight', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false }
});

const Proposal = sequelize.define('Proposal', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false }
});

// Relationships
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
User.hasMany(Client, { foreignKey: 'userId', as: 'clients' });
User.hasMany(Insight, { foreignKey: 'userId', as: 'insights' });
User.hasMany(Proposal, { foreignKey: 'userId', as: 'proposals' });

async function runSeed() {
  await sequelize.sync({ alter: true });
  console.log('🔄 Seeding Job Platform Leaderboard Data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Top Freelancers
  const freelancers = [
    { name: "Alex Rivers", email: "alex@test.com", rating: 4.9, jobs: 42, skills: ["React", "Node.js", "AI", "Cloud"] },
    { name: "Sam Chen", email: "sam@test.com", rating: 4.8, jobs: 35, skills: ["Python", "ML", "FastAPI"] },
    { name: "Jordan Smith", email: "jordan@test.com", rating: 4.7, jobs: 28, skills: ["Next.js", "Tailwind", "Framer"] },
    { name: "Taylor Reed", email: "taylor@test.com", rating: 4.6, jobs: 22, skills: ["Solidity", "Web3", "Go"] },
    { name: "Casey Lee", email: "casey@test.com", rating: 4.5, jobs: 18, skills: ["UI/UX", "Figma", "Design"] }
  ];

  for (const f of freelancers) {
    const [user] = await User.findOrCreate({
      where: { email: f.email },
      defaults: { name: f.name, password: hashedPassword }
    });
    
    await Profile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        skills: f.skills,
        rating: f.rating,
        completedJobs: f.jobs
      }
    });
  }

  // 2. Create Top Clients
  // We need a userId to attach clients to (admin or a sample user)
  const [admin] = await User.findOrCreate({ where: { email: 'admin@jobplatform.io' }, defaults: { name: 'Admin', password: hashedPassword } });

  const clients = [
    { name: "Stripe", budget: 250000, projects: 124, rating: 4.9 },
    { name: "Airbnb", budget: 180000, projects: 89, rating: 4.8 },
    { name: "Coinbase", budget: 145000, projects: 67, rating: 4.7 },
    { name: "Shopify", budget: 120000, projects: 54, rating: 4.9 },
    { name: "Vercel", budget: 85000, projects: 32, rating: 5.0 }
  ];

  for (const c of clients) {
    await Client.findOrCreate({
      where: { name: c.name },
      defaults: {
        userId: admin.id,
        budgetSpent: c.budget,
        projectsPosted: c.projects,
        rating: c.rating
      }
    });
  }

  // 3. Create Seed Jobs (Opportunities)
  const jobs = [
    { title: "Senior React Architect", company: "MetaScale", rate: "$120/hr", tags: ["React", "TypeScript", "Architecture"] },
    { title: "AI Research Engineer", company: "Google DeepMind", rate: "$200/hr", tags: ["AI", "ML", "Python"] },
    { title: "Fullstack Developer (Node/Next)", company: "Vercel", rate: "$90/hr", tags: ["Node.js", "Next.js", "Tailwind"] },
    { title: "Cloud Security Specialist", company: "CyberNexus", rate: "$110/hr", tags: ["Cloud", "Security", "Azure"] },
    { title: "UI/UX Visual Designer", company: "DesignShift", rate: "$75/hr", tags: ["UI/UX", "Figma", "Design"] },
    { title: "Smart Contract Developer", company: "EtherFlow", rate: "$150/hr", tags: ["Solidity", "Web3", "Blockchain"] }
  ];

  for (const j of jobs) {
    await Opportunity.findOrCreate({
      where: { title: j.title },
      defaults: j
    });
  }

  console.log('✅ Seeding Complete. Freelancers, Clients, and Jobs are ready.');
  process.exit(0);
}

runSeed();
