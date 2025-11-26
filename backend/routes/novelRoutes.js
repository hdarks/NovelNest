const express = require('express');
const router = express.Router();
const { createNovel, getAllNovels, getNovelById, updateNovel,
    deleteNovel, getNovelsByAuthor, rateNovel, getTopRatedNovel,
    getTrendingNovels, searchNovels } = require('../controllers/novelController');
const { protectAuthor, protectUser } = require('../middlewares/authMiddleware');
const validateNovel = require('../validators/novelValidator');
const handleValidationErrors = require('../middlewares/handleValidationErrors');


router.post('/create', protectAuthor, validateNovel, handleValidationErrors, createNovel);
router.get('/my-novels', protectAuthor, getNovelsByAuthor);
router.get('/top-rated', getTopRatedNovel);
router.get('/trending', getTrendingNovels);
router.get('/all', getAllNovels);
router.get('/search', searchNovels);

router.get('/:id', getNovelById);
router.put('/:novelId', protectAuthor, updateNovel);
router.delete('/:novelId', protectAuthor, deleteNovel);
router.post('/:novelId/rate', protectUser, rateNovel);

module.exports = router;