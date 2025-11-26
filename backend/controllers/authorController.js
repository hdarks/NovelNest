const Author = require('../models/Author');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const Activity = require('../models/Activity');
const Review = require('../models/Review');

const registerAuthor = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAuthor = await Author.findOne({ email });
        if (existingAuthor) return res.status(400).json({ message: 'Author already Exists' });

        const hashedPassword = await bcrypt.hash(password, 12);

        const author = new Author({ name, email, password: hashedPassword });
        await author.save();
        res.status(201).json({ message: 'Author registered Successfully', author });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const loginAuthor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const author = await Author.findOne({ email });
        if (!author) return res.status(404).json({ message: 'Author not Found' });

        const isMatch = await bcrypt.compare(password, author.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid Credentials' });

        const token = jwt.sign({ id: author._id, role: 'author' }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, role: 'author', user: { _id: author._id, name: author.name, email: author.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getAuthorProfile = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id).select('-password');
        if (!author) return res.status(404).json({ message: 'Author not Found' });
        res.json(author);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getMe = asyncHandler(async (req, res) => {
    const author = await Author.findById(req.user.id).select('-password');
    if (!author) {
        res.status(404);
        throw new Error('Author not found');
    }
    res.status(200).json(author);
});

const getAuthorStats = async (req, res) => {
    try {
        const authorId = req.user._id;
        const totalNovels = await Novel.countDocuments({ author: authorId });
        const totalChapters = await Chapter.countDocuments({ createdBy: authorId });

        const recentNovel = await Novel.findOne({ author: authorId }).sort('-createdAt');
        const recentChapter = await Chapter.findOne({ createdBy: authorId }).sort('-createdAt');

        const chapterDocs = await Chapter.find({ createdBy: authorId });
        const totalWords = chapterDocs.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        const drafts = await Novel.countDocuments({ author: authorId, status: 'draft' });

        const novelDocs = await Novel.find({ author: authorId });
        const totalViews = novelDocs.reduce((sum, novel) => sum + (novel.views || 0), 0);
        const totalReviews = await Review.countDocuments({ novelId: { $in: novelDocs.map(n => n._id) } });

        res.status(200).json({
            totalNovels,
            totalChapters,
            recentNovel: recentNovel?.title || null,
            recentChapter: recentChapter?.title || null,
            totalWords,
            drafts,
            totalViews,
            totalReviews
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
}

const getAuthorActivity = async (req, res) => {
    try {
        const authorId = req.user._id;

        const activityDocs = await Activity.find({ authorId })
            .sort({ createdAt: -1 })
            .limit(50);

        const formatted = activityDocs.map(act => ({
            action: act.type,
            message: act.message,
            timestamp: act.createdAt
        }));
        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching activity', error: err.message });
    }
}

const getAuthorReviews = async (req, res) => {
    try {
        const authorId = req.user._id;

        const novels = await Novel.find({ author: authorId }).select('_id');
        const novelIds = novels.map(novel => novel._id);

        const reviews = await Review.find({ novelId: { $in: novelIds } })
            .populate('userId', 'name')
            .populate('novelId', 'title')
            .sort({ createdAt: -1 });

        const formatted = reviews.map(r => ({
            _id: r._id,
            novelTitle: r.novelId?.title,
            userName: r.userId?.name,
            rating: r.rating,
            reviewText: r.reviewText,
            createdAt: r.createdAt
        }));
        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews', error: err.message });
    }
}

module.exports = {
    registerAuthor,
    loginAuthor,
    getAuthorProfile,
    getMe,
    getAuthorStats,
    getAuthorActivity,
    getAuthorReviews
}