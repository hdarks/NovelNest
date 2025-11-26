const Novel = require('../models/Novel');
const Review = require('../models/Review');

const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const reviews = await Review.find({ userId }).populate("novelId", "genre");
        const genreCount = {};

        reviews.forEach(r => {
            const genre = r.novelId.genre;
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });

        const topGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([genre]) => genre);

        const reviewedIds = reviews.map(r => r.novelId._id.toString());
        const recommendations = await Novel.find({
            genre: { $in: topGenres },
            _id: { $nin: reviewedIds }
        }).limit(10);
        res.status(200).json({ recommendations });
    } catch (err) {
        res.status(500).json({ message: 'Error generating recommendations', error: err.message });
    }
};

module.exports = { getRecommendations }