const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB and update the test user
async function updateTestUserPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reckon');
    console.log('MongoDB connected successfully');
    
    // Find the test user
    console.log('Looking for test user...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Test user not found. Creating one with proper password...');
      
      // Hash password properly
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
      console.log('Test user created successfully with proper password hash');
    } else {
      console.log('Test user found, updating password...');
      
      // Update the existing user's password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test123!', salt);
      
      testUser.password = hashedPassword;
      await testUser.save();
      
      console.log('Test user password updated successfully');
      
      // Verify the update worked
      const updatedUser = await User.findOne({ email: 'test@example.com' });
      const isPasswordValid = await bcrypt.compare('Test123!', updatedUser.password);
      console.log(`Password verification after update: ${isPasswordValid ? 'SUCCESS' : 'FAILED'}`);
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

// Run the update
updateTestUserPassword();