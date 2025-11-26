const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    readingProgress: [{
        novel: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel' },
        chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
        lastReadAt: { type: Date, default: Date.now }
    }],
    readingStreak: {
        count: { type: Number, default: 0 },
        lastReadDate: { type: Date }
    }
});

module.exports = mongoose.model('User', userSchema);