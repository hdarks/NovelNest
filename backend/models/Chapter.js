const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    novel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Novel',
        required: true
    },
    chapterNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        trim: true
    },
    textContent: {
        type: String,
        required: true
    },
    wordCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

chapterSchema.index({ novel: 1, chapterNumber: 1 }, { unique: true });
module.exports = mongoose.model('Chapter', chapterSchema);