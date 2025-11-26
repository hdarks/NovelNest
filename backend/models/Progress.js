const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    novelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Novel',
        required: true
    },
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true
    },
    chapterNumber: Number,
    completed: {
        type: Boolean,
        default: false
    },
    lastReadAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Progress', progressSchema);