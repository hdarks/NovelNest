const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protectUser } = require('../middlewares/authMiddleware');

router.get('/for-you', protectUser, getRecommendations);

module.exports = router;