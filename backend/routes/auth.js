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

// @route   GET api/auth/me
// @desc    Get user profile and timeline data
// @access  Private
router.get('/me', auth, authController.getProfile);

// @route   PUT api/auth/profile
// @desc    Update user profile data
// @access  Private
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
