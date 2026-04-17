const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite Database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photoURL: {
    type: DataTypes.STRING
  },
  isOnboarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  phone: DataTypes.STRING,
  location: DataTypes.STRING,
  skills: {
    type: DataTypes.TEXT, // Stored as JSON string
    get() {
      const val = this.getDataValue('skills');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('skills', JSON.stringify(val));
    }
  },
  secondarySkills: DataTypes.TEXT,
  experienceLevel: DataTypes.STRING,
  yearsOfExperience: DataTypes.INTEGER,
  portfolioLinks: {
    type: DataTypes.TEXT, // Stored as JSON string
    get() {
      const val = this.getDataValue('portfolioLinks');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('portfolioLinks', JSON.stringify(val));
    }
  },
  jobType: DataTypes.STRING,
  availability: DataTypes.INTEGER,
  expectedSalary: DataTypes.STRING,
  bio: DataTypes.TEXT,
  resumeURL: DataTypes.STRING
});

// Relationships
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// Sync State
sequelize.sync().then(() => {
  console.log('Database & tables created!');
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('Freelancer Platform SQL API is running');
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isOnboarded: false
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isOnboarded: user.isOnboarded } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, isOnboarded: user.isOnboarded } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Me
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: Profile, as: 'profile' }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ user: { id: user.id, email: user.email, name: user.name, isOnboarded: user.isOnboarded, profile: user.profile } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile (Onboarding)
app.post('/api/profile', authenticate, async (req, res) => {
  try {
    const profileData = req.body;
    const userId = req.userId;

    let profile = await Profile.findOne({ where: { userId } });
    if (profile) {
      await profile.update(profileData);
    } else {
      profile = await Profile.create({ ...profileData, userId });
    }

    // Mark user as onboarded
    await User.update({ isOnboarded: true }, { where: { id: userId } });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
