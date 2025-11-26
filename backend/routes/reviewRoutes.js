const express = require('express');
const router = express.Router();
const { getUserReviews, submitReview, getPendingReviews, updateReview } = require('../controllers/reviewController');
const { protectUser } = require('../middlewares/authMiddleware');

router.get('/user', protectUser, getUserReviews);
router.get('/pending', protectUser, getPendingReviews);

router.post('/:novelId', protectUser, submitReview);
router.put('/:reviewId', protectUser, updateReview);

module.exports = router;