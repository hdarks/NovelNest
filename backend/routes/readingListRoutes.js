const express = require('express');
const { protectUser } = require('../middlewares/authMiddleware');
const { addToReadingList, getFromReadingList, deleteFromReadingList } = require('../controllers/readingListController');
const router = express.Router();

router.post('/add', protectUser, addToReadingList);
router.get('/', protectUser, getFromReadingList);
router.delete('/:novelId', protectUser, deleteFromReadingList);

module.exports = router;