const ReadingList = require('../models/ReadingList');
const Progress = require('../models/Progress');

const addToReadingList = async (req, res) => {
    try {
        const userId = req.user.id;
        const { novelId } = req.body;

        const exists = await ReadingList.findOne({ userId, novelId });
        if (exists) return res.status(200).json({ message: 'Already in reading List' });

        const entry = new ReadingList({ userId, novelId });
        await entry.save();
        res.status(201).json({ message: 'Added to the reading list', entry });
    } catch (err) {
        console.error('Error adding to reading list', err);
        res.status(500).json({ error: err.message });
    }
}

const getFromReadingList = async (req, res) => {
    try {
        const userId = req.user.id;

        const entries = await ReadingList.find({ userId })
            .populate('novelId', 'title genre description coverImage');

        const progress = await Progress.find({ userId });
        const progressMap = {};
        progress.forEach(p => {
            progressMap[p.novelId.toString()] = p.lastReadAt;
        });

        const enriched = entries.map(entry => ({
            ...entry.novelId.toObject(),
            addedAt: entry.addedAt,
            lastReadAt: progressMap[entry.novelId.toString()] || null
        }));

        res.json(enriched);
    } catch (err) {
        console.error('Error fetching Reading List', err);
        res.status(500).json({ message: 'Failed to fetch Reading List', error: err.message });
    }
}

const deleteFromReadingList = async (req, res) => {
    try {
        const userId = req.user.id;
        const { novelId } = req.params;

        const deleted = await ReadingList.findOneAndDelete({ userId, novelId });
        if (!deleted) {
            return res.status(404).json({ message: 'Novel not found in reading list' });
        }
        res.json({ message: 'Removed from Reading List' });
    } catch (err) {
        console.error('Error removing from Reading List', err);
        res.status(500).json({ message: 'Failed to remove from reading list', error: err.message });
    }
}

module.exports = { addToReadingList, getFromReadingList, deleteFromReadingList }