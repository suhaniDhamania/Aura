const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const moodController = require('../controllers/moodController');

// @route   POST api/mood
// @desc    Log today's mood
// @access  Private
router.post('/', auth, moodController.logMood);

// @route   GET api/mood
// @desc    Get mood history
// @access  Private
router.get('/', auth, moodController.getMoodHistory);

// @route   GET api/mood/config
// @desc    Get mood configuration (labels, icons, colors)
// @access  Public
router.get('/config', moodController.getMoodConfig);

// @route   POST api/mood/predict
// @desc    Predict mood from text using AI
// @access  Private
router.post('/predict', auth, moodController.predictMood);

module.exports = router;
