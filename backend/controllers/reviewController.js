const Review = require('../models/Review');
const Progress = require('../models/Progress');
const Novel = require('../models/Novel');
const Activity = require('../models/Activity');

const submitReview = async (req, res) => {
    try {
        const { novelId } = req.params;
        const { rating, reviewText } = req.body;
        const userId = req.user.id;
        const novel = await Novel.findById(novelId);

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        const existing = await Review.findOne({ userId, novelId });
        if (existing) {
            existing.rating = rating;
            existing.reviewText = reviewText;
            existing.updatedAt = new Date();
            await existing.save();
            await Activity.create({
                userId,
                type: "review",
                novelId,
                rating,
                message: `Rated ${novel.title} ${rating}⭐ and submitted review`
            });
            return res.json({ message: 'Review updated', review: existing });
        }

        const newReview = new Review({ userId, novelId, rating, reviewText });
        await newReview.save();
        await Activity.create({
            userId,
            type: "review",
            novelId,
            rating,
            message: `Rated ${novel.title} ${rating}⭐ and submitted review`
        });
        res.status(201).json({ message: 'Review Submitted', review: newReview });
    } catch (err) {
        console.error('Error submitting review', err);
        res.status(500).json({ message: 'Error in submitting review', error: err });
    }
}

const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await Review.find({ userId }).populate('novelId', 'title');
        res.json(reviews);
    } catch (err) {
        console.error('Error in fetching user review', err);
        res.status(500).json({ message: 'Unable to fetch user review', error: err });
    }
}

const getPendingReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const completedProgress = await Progress.find({ userId, completed: true }).populate('novelId', 'title coverImage');
        const reviewed = await Review.find({ userId }).select('novelId');

        const reviewedIds = new Set(reviewed.map(r => r.novelId.toString()));
        const pending = completedProgress.map(p => p.novelId)
            .filter(novel => !reviewedIds.has(novel._id.toString()));
        res.json(pending);
    } catch (err) {
        console.error('Error in fetching pendong reviews', err);
        res.status(500).json({ message: 'Failed to fetch pending reviews', error: err });
    }
}

const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, reviewText } = req.body;
        const userId = req.user.id;

        if (rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this review' });
        }
        review.rating = rating;
        review.reviewText = reviewText;
        review.updatedAt = new Date();
        await review.save();
        res.status(200).json({ message: 'Review updated', review });
    } catch (err) {
        console.error('Error in updating review', err);
        res.status(500).json({ message: 'Update review Error', error: err });
    }
}

module.exports = { submitReview, getUserReviews, getPendingReviews, updateReview }