const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');

const { MONGO_URI } = process.env;

const seedUsers = [
  {
    email: 'ops@demo.com',
    password_hash: 'ops123',
    role: 'OPS',
  },
  {
    email: 'finance@demo.com',
    password_hash: 'fin123',
    role: 'FINANCE',
  },
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create seed users (password hashing happens in pre-save hook)
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log('\n--- Seed Complete ---');
    console.log('Users created:');
    console.log('  OPS:     ops@demo.com / ops123');
    console.log('  FINANCE: finance@demo.com / fin123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
