const Mood = require('../models/Mood');
const User = require('../models/User');
const { detectEmotion } = require('../utils/aiHandler');

exports.logMood = async (req, res) => {
    try {
        const { moodType, note } = req.body;
        
        // Get today's local date as YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Upsert the mood for today
        const mood = await Mood.findOneAndUpdate(
            { user: req.user.id, date: today },
            { $set: { moodType, note, user: req.user.id, date: today } },
            { new: true, upsert: true } // Create if doesn't exist, update if it does
        );

        // Add to activities
        const user = await User.findById(req.user.id);
        if (user) {
            user.activities.push({ text: `Logged daily Aura: ${moodType}`, type: 'info' });
            if (user.activities.length > 50) user.activities.shift();
            await user.save();
        }

        res.json({ message: 'Mood logged successfully', mood });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMoodHistory = async (req, res) => {
    try {
        // Fetch last 30 entries (or days) for user
        const moods = await Mood.find({ user: req.user.id })
                                .sort({ date: -1 })
                                .limit(30);
        res.json(moods);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMoodConfig = async (req, res) => {
    // This could also be stored in a "Config" collection in MongoDB
    const moodConfig = {
        awesome: { icon: '🤩', label: 'Awesome', color: '#10b981' },
        good: { icon: '🙂', label: 'Good', color: '#0ea5e9' },
        energetic: { icon: '⚡', label: 'Energetic', color: '#8b5cf6' },
        neutral: { icon: '😐', label: 'Neutral', color: '#64748b' },
        sad: { icon: '😔', label: 'Sad', color: '#f43f5e' },
        stressed: { icon: '😫', label: 'Stressed', color: '#f59e0b' }
    };
    res.json(moodConfig);
};

exports.predictMood = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required for prediction' });
        }

        const predictedMood = await detectEmotion(text);
        res.json({ moodType: predictedMood });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
