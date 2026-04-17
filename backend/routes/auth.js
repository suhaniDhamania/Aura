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

// @route   PUT api/auth/notifications/read
// @desc    Mark all user notifications as read
// @access  Private
router.put('/notifications/read', auth, authController.markNotificationsRead);

// @route   PUT api/auth/settings/password
// @desc    Change user password
// @access  Private
router.put('/settings/password', auth, authController.changePassword);

// @route   DELETE api/auth/settings/account
// @desc    Delete user account
// @access  Private
router.delete('/settings/account', auth, authController.deleteAccount);

module.exports = router;
