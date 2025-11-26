const express = require('express');
const router = express.Router();
const { registerUser,
    loginUser,
    getMe,
    getUserStats
} = require('../controllers/userController');
const { protectUser } = require('../middlewares/authMiddleware');
const handleValidationErrors = require('../middlewares/handleValidationErrors');
const { validateUserRegistration, validateUserLogin } = require('../validators/userValidator');

router.post('/register', validateUserRegistration, handleValidationErrors, registerUser);
router.post('/login', validateUserLogin, handleValidationErrors, loginUser);
router.get('/me', protectUser, getMe);
router.get('/stats', protectUser, getUserStats);

module.exports = router;