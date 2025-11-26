const express = require('express');
const { getUserActivity, logActivity } = require('../controllers/activityController');
const { protectUser } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/user', protectUser, getUserActivity);
router.post('/', protectUser, logActivity);

module.exports = router;