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

module.exports = router;
