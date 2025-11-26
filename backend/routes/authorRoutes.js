const express = require('express');
const router = express.Router();
const { registerAuthor, loginAuthor, getAuthorProfile, getMe, getAuthorStats, getAuthorReviews, getAuthorActivity } = require('../controllers/authorController');
const { protectAuthor } = require('../middlewares/authMiddleware');
const handleValidationErrors = require('../middlewares/handleValidationErrors');
const { validateAuthorLogin, validateAuthorRegistration } = require('../validators/authorValidator');

router.post('/register', validateAuthorRegistration, handleValidationErrors, registerAuthor);
router.post('/login', validateAuthorLogin, handleValidationErrors, loginAuthor);

router.get('/me', protectAuthor, getMe);
router.get('/stats', protectAuthor, getAuthorStats);
router.get('/reviews', protectAuthor, getAuthorReviews);
router.get('/activity', protectAuthor, getAuthorActivity);

router.get('/:id', getAuthorProfile);

module.exports = router;