// This is a fix for login issues in authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Enhanced user login controller
exports.login = async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        status: 'error'
      });
    }

    // Check if user exists with detailed logging
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    console.log('User found:', user ? `Yes (ID: ${user._id})` : 'No');
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        status: 'error',
        details: 'User not found'
      });
    }

    // Check password with detailed logging
    console.log('Comparing provided password with stored hash...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch ? 'Success' : 'Failed');
    
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        status: 'error',
        details: 'Password mismatch'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    console.log('JWT token generated successfully');

    // Return success with user info and token
    console.log('Login successful for user:', user.email);
    res.status(200).json({
      message: 'Login successful',
      status: 'success',
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        username: user.username,
        isDoctor: user.isDoctor
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      status: 'error',
      error: error.message 
    });
  }
};

// Export the improved login function
module.exports = exports;