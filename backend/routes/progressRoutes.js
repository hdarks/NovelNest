const express = require('express');
const { protectUser } = require('../middlewares/authMiddleware');
const router = express.Router();
const { getProgressByUser, getProgressByNovel, updateProgress, getReadingStreak, getContinueReadingList } = require('../controllers/progressController');

router.get('/user', protectUser, getProgressByUser);
router.post('/update', protectUser, updateProgress);
router.get('/streak', protectUser, getReadingStreak);
router.get('/continue-reading', protectUser, getContinueReadingList);

router.get('/novel/:novelId', protectUser, getProgressByNovel);

module.exports = router;