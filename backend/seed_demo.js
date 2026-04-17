const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
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
  qualityReport: { type: DataTypes.TEXT }
});

async function seed() {
  await sequelize.sync({ alter: true });
  
  // Find a user to attach to
  const [user] = await sequelize.query('SELECT id FROM Users LIMIT 1');
  if (!user || user.length === 0) {
    console.error('No users found to attach demo client to.');
    return;
  }
  const userId = user[0].id;

  // Create/Update the Demo Client: TechFlow Solutions
  const [client, created] = await Client.findOrCreate({
    where: { name: 'TechFlow Solutions', userId },
    defaults: {
      contact: 'Sarah Jenkins (CEO)',
      email: 'sarah@techflow.io',
      status: 'Active',
      projectStatus: 'In-Progress',
      totalValue: 50000,
      pendingPayment: 220, // ~18000 INR @ 82
      riskLevel: 'High',
      healthScore: 32,
      lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  });

  if (!created) {
    await client.update({
      pendingPayment: 220,
      riskLevel: 'High',
      healthScore: 32,
      projectStatus: 'In-Progress'
    });
  }

  console.log('✅ Demo Client "TechFlow Solutions" seeded with High Risk and ₹18,040 pending.');
  process.exit(0);
}

seed();
