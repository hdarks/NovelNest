const Activity = require('../models/Activity');
const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');
const mongoose = require('mongoose');
const Review = require('../models/Review');

const createNovel = async (req, res) => {
    try {
        const { title, genre, description, coverImage, createdAt } = req.body;
        const novel = new Novel({
            title,
            genre,
            description,
            author: req.user._id,
            coverImage,
            createdAt
        });
        await novel.save();
        await Activity.create({
            authorId: req.user._id,
            type: "created_novel",
            novelId: novel._id,
            message: `Created Novel ${novel.title}`
        });
        res.status(201).json(novel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getAllNovels = async (req, res) => {
    try {
        const novels = await Novel.find({
            $or: [
                { status: 'published' },
                { status: 'draft' }
            ]
        }).populate('author', 'name').sort('-createdAt');
        res.json(novels);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching novels', error: err.message });
    }
}

const getNovelById = async (req, res) => {
    try {
        const novelId = req.params.id;

        const novel = await Novel.findById(novelId).populate('author', 'name');
        if (!novel) { return res.status(404).json({ message: 'Novel not Found' }); }

        const reviews = await Review.find({ novelId: novelId });
        const averageRating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
        res.json({
            ...novel.toObject(),
            averageRating,
            reviews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const updateNovel = async (req, res) => {
    const { novelId } = req.params;
    const { title, description, genre, coverImage } = req.body;
    try {
        const novel = await Novel.findById(novelId)
        if (!novel) return res.status(404).json({ message: 'Novel not found' });

        if (novel.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to edit this novel' });
        }
        if (title) novel.title = title;
        if (description) novel.description = description;
        if (genre) novel.genre = genre;
        if (coverImage) novel.coverImage = coverImage;

        await novel.save();
        res.status(200).json({ message: 'Novel Updated', novel });
    } catch (err) {
        res.status(500).json({ message: 'Error in Updating novel', error: err.message });
    }
}

const deleteNovel = async (req, res) => {
    const { novelId } = req.params;
    try {
        const novel = await Novel.findById(novelId);
        if (!novel) return res.status(404).json({ message: 'Novel not found' });

        if (novel.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this novel' });
        }
        await Chapter.deleteMany({ novel: novelId });
        await novel.deleteOne();
        await Activity.create({
            authorId: req.user._id,
            type: "deleted_novel",
            novelId: novelId,
            message: `Deleted Novel ${novel.title}`
        });
        res.status(200).json({ message: 'Novel deleted Successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting novel', error: err.message });
    }
}

const getNovelsByAuthor = async (req, res) => {
    try {
        const authorId = new mongoose.Types.ObjectId(req.user._id);
        const novels = await Novel.find({ author: authorId })
            .sort('-createdAt')
            .select('_id title description genre coverImage author createdAt')
            .lean();

        const novelsWithChapters = await Promise.all(
            novels.map(async (novel) => {
                const chapterCount = await Chapter.countDocuments({ novel: novel._id });
                return {
                    _id: novel._id,
                    title: novel.title,
                    description: novel.description,
                    genre: novel.genre,
                    coverImage: novel.coverImage,
                    author: novel.author,
                    createdAt: novel.createdAt,
                    chapterCount
                };
            })
        );
        res.status(200).json(novelsWithChapters);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching novels', error: err.message });
    }
}

const rateNovel = async (req, res) => {
    const { novelId } = req.params;
    const { score, review } = req.body;
    const userId = req.user._id;

    try {
        const novel = await Novel.findById(novelId);
        if (!novel) return res.status(404).json({ message: 'Novel not found' });

        const existingRating = novel.ratings.find(r => r.user.toString() === userId.toString());
        if (existingRating) {
            existingRating.score = score;
            existingRating.review = review;
        } else {
            novel.ratings.push({ user: userId, score, review });
        }
        await novel.save();
        res.status(200).json({ message: 'Rating Submitted', ratings: novel.ratings });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting rating', error: err.message });
    }
}

const getTopRatedNovel = async (req, res) => {
    try {
        const novels = await Novel.find().populate('author', 'name').lean();

        const ratedNovels = await Promise.all(
            novels.map(async (novel) => {
                const reviews = await Review.find({ novelId: novel._id });
                const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
                return {
                    ...novel,
                    averageRating: avgRating.toFixed(1),
                    reviewCount: reviews.length
                };
            })
        );

        const topRated = ratedNovels
            .filter((n) => n.reviewCount >= 3)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 10);

        res.status(200).json(topRated);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching Top Rated Novels', error: err.message });
    }
}

const getTrendingNovels = async (req, res) => {
    try {
        const novels = await Novel.find().lean();

        const now = new Date();
        const trendingNovels = novels.map(novel => {
            const views = novel.views || 0;
            const recentRatings = novel.ratings?.filter(r => {
                const daysAgo = (now - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
                return daysAgo <= 7;
            }).length || 0;

            const newReviews = novel.ratings?.filter(r => r.review)?.length || 0;
            const isNew = (now - new Date(novel.createdAt)) / (1000 * 60 * 60 * 24) <= 14;

            const score = (views * 0.5) + (recentRatings * 2) + (newReviews * 1.5) + (isNew ? 5 : 0);

            return {
                ...novel,
                trendingScore: score
            };
        });

        const sorted = trendingNovels.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 10);

        res.status(200).json(sorted);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trending novels', error: err.message });
    }
};

const searchNovels = async (req, res) => {
    const query = req.query.query?.trim();
    if (!query) return res.status(400).json({ message: 'Missing search query' });

    const regex = new RegExp(query, 'i');
    const novels = await Novel.find({
        $or: [
            { title: regex },
            { authorName: regex },
            { genre: regex }
        ]
    });
    res.status(200).json(novels);
}


module.exports = {
    createNovel, getAllNovels, getNovelById, updateNovel,
    deleteNovel, getNovelsByAuthor, rateNovel, getTopRatedNovel,
    getTrendingNovels, searchNovels
}