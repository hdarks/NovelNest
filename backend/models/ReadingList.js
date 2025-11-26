const mongoose = require('mongoose');

const readingListSchema = new mongoose.Schema({
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
    addedAt: {
        type: Date,
        default: Date.now
    }
});

readingListSchema.index({ userId: 1, novelId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingList', readingListSchema);