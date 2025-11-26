const Activity = require('../models/Activity');
const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');
const User = require('../models/User');

const createChapter = async (req, res) => {
    const { novelId } = req.params;
    const { chapterNumber, title, textContent } = req.body;
    try {
        const wordCount = textContent ? textContent.trim().split(/\s+/).length : 0;
        const newChapter = await Chapter.create({
            novel: novelId,
            chapterNumber,
            title,
            textContent,
            wordCount,
            createdBy: req.user._id
        });

        const novel = await Novel.findById(novelId);
        if (novel && novel.status === 'draft') {
            novel.status = 'published';
            await novel.save();
        }

        if (novel) {
            try {
                await Activity.create({
                    authorId: req.user._id,
                    type: "wrote_chapter",
                    novelId: novelId,
                    chapterNumber,
                    message: `Wrote Chapter ${chapterNumber} in ${novel.title}`
                });
            } catch (activityErr) {
                console.warn('Activity logging failed', activityErr.message);
            }
        }
        res.status(201).json({ message: 'Chapter created', chapter: newChapter });
    } catch (err) {
        res.status(500).json({ message: 'Error in creating chapter', error: err.message });
    }
};

const getChaptersByNovel = async (req, res) => {
    try {
        const chapters = await Chapter.find({ novel: req.params.novelId })
            .sort({ chapterNumber: 1 })
            .select('chapterNumber title textContent novel');
        res.status(200).json(chapters);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching chapters' });
    }
};

const updateChapter = async (req, res) => {
    const { chapterId } = req.params;
    const { title, textContent } = req.body;
    try {
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        if (chapter.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to edit this chapter' });
        }
        if (title) chapter.title = title;
        if (textContent) {
            chapter.textContent = textContent;
            chapter.wordCount = textContent.trim().split(/\s+/).length;
        }
        await chapter.save();
        res.status(200).json({ message: 'Chapter Updated', chapter });
    } catch (err) {
        res.status(500).json({ message: 'Error updating chapter', error: err.message });
    }
};

const deleteChapter = async (req, res) => {
    const { chapterId } = req.params;
    try {
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        if (chapter.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this chapter' });
        }
        await chapter.deleteOne();
        res.status(200).json({ message: 'Chapter deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting chapter', error: err.message });
    }
}

const markChapterAsRead = async (req, res) => {
    const { chapterId } = req.params;
    const userId = req.user._id;

    const chapter = await Chapter.findById(chapterId).populate('novel');
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    await User.updateOne(
        { _id: userId, 'readingProgress.novel': chapter.novel._id },
        {
            $set: {
                'readingProgress.$.chapter': chapter._id,
                'readingProgress.$.lastReadAt': new Date()
            }
        },
        { upsert: true }
    );
    res.status(200).json({ message: 'Progress saved' });
};

module.exports = {
    createChapter,
    getChaptersByNovel,
    updateChapter,
    deleteChapter,
    markChapterAsRead
}