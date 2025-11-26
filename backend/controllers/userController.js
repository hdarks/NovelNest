const User = require('../models/User');
const Novel = require('../models/Novel');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Progress = require('../models/Progress');
const Review = require('../models/Review');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User is already Registered' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User Registered successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not Found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, role: 'user', user: { _id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
}

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json(user);
});

const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const streak = user.readingStreak || { count: 0, lastReadDate: null };
        const chapterCompleted = await Progress.countDocuments({ userId, completed: true });
        const reviewsSubmitted = await Review.countDocuments({ userId });

        const novelsCompleted = await Progress.aggregate([
            { $match: { userId: user._id, completed: true } },
            { $group: { _id: "$novelId", chapters: { $sum: 1 } } },
            { $count: "completedNovels" }
        ]);

        // const badgesEarned = await Badge.countDocuments({userId});

        res.json({
            streak,
            chapterCompleted,
            reviewsSubmitted,
            novelsCompleted: novelsCompleted[0]?.completedNovels || 0,
            // badgesEarned
        });
    } catch (err) {
        console.error('Error fetching user stats', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUserStats
};