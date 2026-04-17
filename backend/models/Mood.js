const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moodType: {
        type: String,
        required: true,
        enum: ['awesome', 'good', 'neutral', 'sad', 'stressed', 'energetic']
    },
    note: {
        type: String,
        default: ''
    },
    date: {
        type: String, // Stored as YYYY-MM-DD string to ensure strictly one entry per local day easily
        required: true
    }
}, { timestamps: true });

// Ensure a user can only have one mood logged per day
moodSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema);
