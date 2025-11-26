const Progress = require('../models/Progress');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Novel = require('../models/Novel');

const getProgressByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const progress = await Progress.find({ userId });
        res.json(progress);
    } catch (err) {
        console.error('Error fetching progress', err);
        res.status(500).json({ message: 'Failed to fetch progress', error: err });
    }
};

const getProgressByNovel = async (req, res) => {
    try {
        const userId = req.user.id;
        const novelId = req.params.novelId;
        const progress = await Progress.find({ userId, novelId })
            .populate('chapterId', 'title chapterNumber');
        res.json(progress);
    } catch (err) {
        console.error('Error fetching novel progress', err);
        res.status(500).json({ message: 'Failed to fetch novel progress', error: err });
    }
};

const updateProgress = async (req, res) => {
    try {
        const { novelId, chapterId, chapterNumber } = req.body;
        const userId = req.user.id;
        const novel = await Novel.findById(novelId);

        const updateStreak = async (userId) => {
            const user = await User.findById(userId);
            const today = new Date().toDateString();
            const lastRead = user.readingStreak?.lastReadDate?.toDateString();

            if (lastRead === today) return;
            if (lastRead === new Date(Date.now() - 86400000).toDateString()) {
                user.readingStreak.count += 1;
            } else {
                user.readingStreak.count = 1;
            }
            user.readingStreak.lastReadDate = new Date();
            await user.save();

            if (lastRead !== today) {
                const streakMessage = user.readingStreak.count === 1
                    ? "Started a new Reading Streak"
                    : `Continued reading streak: ${user.readingStreak.count} days.`;
                await Activity.create({
                    userId,
                    type: "streak",
                    message: streakMessage
                });
            }
        }

        const existing = await Progress.findOne({ userId, novelId, chapterId });
        if (existing) {
            existing.completed = true;
            existing.lastReadAt = new Date();
            await existing.save();
            await updateStreak(userId);
            await Activity.create({
                userId,
                type: "read",
                novelId,
                chapterNumber,
                message: `Finished chapter ${chapterNumber} of ${novel.title}`
            });
            return res.json({ message: 'Progress Updated', progress: existing });
        }

        const newProgress = new Progress({
            userId,
            novelId,
            chapterId,
            chapterNumber,
            completed: true,
            lastReadAt: new Date()
        });
        await newProgress.save();
        await updateStreak(userId);

        await Activity.create({
            userId,
            type: 'read',
            novelId,
            chapterNumber,
            message: `Finished reading ${chapterNumber} of ${novel.title}`
        });
        res.status(201).json({ message: 'Progress created', progress: newProgress });
    } catch (err) {
        console.error('Error updating progress', err);
        res.status(500).json({ message: 'Failed to update progress', error: err });
    }
};

const getReadingStreak = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('readingStreak');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            count: user.readingStreak?.count || 0,
            lastReadDate: user.readingStreak?.lastReadDate || null
        });
    } catch (err) {
        console.error('Error fetching reading streak', err);
        res.status(500).json({ message: 'Failed to fetch reading streak', error: err });
    }
};

const getContinueReadingList = async (req, res) => {
    try {
        const userId = req.user.id;

        const allProgress = await Progress.find({ userId })
            .populate('novelId', 'title')
            .populate('chapterId', 'title chapterNumber')
            .sort({ lastReadAt: -1 });

        const latestByNovel = {};
        for (const p of allProgress) {
            const novelKey = p.novelId._id.toString();
            if (!latestByNovel[novelKey]) {
                latestByNovel[novelKey] = {
                    _id: p._id,
                    novel: p.novelId,
                    chapter: p.chapterId,
                    lastReadAt: p.lastReadAt
                };
            }
        }
        const continueReading = Object.values(latestByNovel);
        res.status(200).json({ continueReading });
    } catch (err) {
        console.error('Error fetching continue reading list', err);
        res.status(500).json({ message: 'Failed to fetch continue reading list', error: err.message });
    }
};

module.exports = {
    getProgressByUser,
    getProgressByNovel,
    updateProgress,
    getReadingStreak,
    getContinueReadingList
}