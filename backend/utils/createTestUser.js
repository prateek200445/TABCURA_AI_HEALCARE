const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create a test user if it doesn't exist
async function createTestUser() {
  try {
    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test123!', salt);
    
    // Create new user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      gender: 'prefer-not-to-say'
    });
    
    // Save user directly to avoid pre-save hooks
    await testUser.save();
    
    console.log('Test user created successfully');
    console.log('===== TEST USER CREDENTIALS =====');
    console.log('Email: test@example.com');
    console.log('Password: Test123!');
    console.log('================================');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Export function
module.exports = createTestUser;