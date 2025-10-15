const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  try {
    // Create a direct user without using the model's pre-save hook
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reckon');
    console.log('MongoDB connected successfully');
    
    // Create a plaintext password
    const plainPassword = 'TestLogin123!';
    
    // Hash it manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Get the User model
    const User = mongoose.model('User');
    
    // Check if test login user exists
    let testLoginUser = await User.findOne({ email: 'testlogin@example.com' });
    
    if (testLoginUser) {
      // Delete the user if it exists
      await User.deleteOne({ email: 'testlogin@example.com' });
      console.log('Deleted existing test login user');
    }
    
    // Create a new test login user with the manually hashed password
    testLoginUser = new mongoose.model('User')({
      firstName: 'Test',
      lastName: 'Login',
      email: 'testlogin@example.com',
      username: 'testlogin',
      password: hashedPassword, // Use the manually hashed password
      gender: 'prefer-not-to-say'
    });
    
    // Save without triggering the pre-save hook
    await testLoginUser.save();
    console.log('Created test login user with manually hashed password');
    
    // Now test if bcrypt.compare works with the manually hashed password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`Manual password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\n===== TEST LOGIN USER CREDENTIALS =====');
    console.log('Email: testlogin@example.com');
    console.log('Password:', plainPassword);
    console.log('=======================================');
    
    // Close connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testLogin();