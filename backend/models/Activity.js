const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: false
    },
    type: {
        type: String,
        enum: ["read", "review", "streak", "badge", "created_novel", "wrote_chapter", "deleted_novel"],
        required: true
    },
    novelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Novel'
    },
    chapterNumber: Number,
    rating: Number,
    badgeName: String,
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', activitySchema);