const express = require('express');
const router = express.Router();
const { createChapter, getChaptersByNovel, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protectAuthor } = require('../middlewares/authMiddleware');
const { validateChapterUpdates, validateChapter } = require('../validators/chapterValidator');

router.post('/:novelId', protectAuthor, validateChapter, createChapter);
router.get('/novel/:novelId', getChaptersByNovel);
router.put('/:chapterId', protectAuthor, validateChapterUpdates, updateChapter);
router.delete('/:chapterId', protectAuthor, deleteChapter);

module.exports = router;