const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// @route   POST api/auth/update-theme
// @desc    Save user theme preferences
// @access  Private
router.post('/update-theme', auth, authController.updateTheme);

module.exports = router;
