const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        default: 'General'
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    coverImage: {
        type: String,
        default: 'https://localhost:8000/assets/novel-logo.png'
    },
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        score: { type: Number, min: 1, max: 5, required: true },
        review: { type: String }
    }],
    tags: [{
        type: String
    }],
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

novelSchema.pre('deleteOne', { document: true }, async function (next) {
    const Chapter = require('./Chapter');
    await Chapter.deleteMany({ novel: this._id });
    next();
});

module.exports = mongoose.model('Novel', novelSchema);