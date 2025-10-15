const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/authController');
const fixedLoginController = require('../controllers/fix-login');

// Route for user registration
router.post('/signup', signup);

// Route for user login - using fixed controller
router.post('/login', fixedLoginController.login);

module.exports = router;
