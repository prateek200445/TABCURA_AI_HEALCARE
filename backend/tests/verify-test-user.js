const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reckon');
    console.log('MongoDB connected successfully');
    
    // Find the test user
    console.log('Looking for test user...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Test user not found. Creating one...');
      
      // Create test user if not found
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test123!', salt);
      
      const newTestUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        gender: 'prefer-not-to-say'
      });
      
      await newTestUser.save();
      console.log('Test user created successfully');
    } else {
      console.log('Test user found:');
      console.log(`- Name: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`- Email: ${testUser.email}`);
      console.log(`- Password: Test123! (hashed in DB)`);
      
      // Test password verification manually
      console.log('\nTesting password verification...');
      const isPasswordValid = await bcrypt.compare('Test123!', testUser.password);
      console.log(`Password verification result: ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('\n===== TEST USER CREDENTIALS =====');
    console.log('Email: test@example.com');
    console.log('Password: Test123!');
    console.log('================================');
    
    // Close connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
runTest();