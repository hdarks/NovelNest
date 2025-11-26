const { body } = require('express-validator');

const validateNovel = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title must be under 100 characters'),
    body('genre')
        .trim()
        .notEmpty().withMessage('Genre is required')
        .isString().withMessage('Genre must be a String'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('coverImage')
        .optional()
        .isURL().withMessage('Cover image must be a valid URL'),
    body('author')
        .notEmpty().withMessage('Author ID is required')
        .isMongoId().withMessage('Author ID must be a valid MongoDB ObjectId'),
    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .isString().withMessage('Each tag mujst be a string')
];

module.exports = validateNovel;