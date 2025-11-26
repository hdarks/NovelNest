const Activity = require('../models/Activity');

const getUserActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const activity = await Activity.find({ userId })
            .sort({ createdAt: -1 })
            .populate("novelId", "title coverImage");
        res.status(200).json(activity);
    } catch (err) {
        console.error('Error fetching activity', err);
        res.status(500).json({ error: err.message });
    }
}

const logActivity = async (req, res) => {
    try {
        const { type, novelId, chapterNumber, rating, badgeName, message } = req.body;
        const userId = req.user.id;

        const newActivity = new Activity({
            userId, type, novelId, chapterNumber, rating, badgeName, message
        });
        await newActivity.save();
        res.status(201).json({ message: 'Activity logged', activity: newActivity });
    } catch (err) {
        console.error('Error logging activity', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getUserActivity, logActivity }