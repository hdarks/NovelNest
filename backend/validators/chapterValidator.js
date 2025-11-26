const { body } = require('express-validator');

const validateChapter = [
    body('novel')
        .notEmpty().withMessage('Novel ID required')
        .isMongoId().withMessage('Novel ID must be a valid MongoDB ObjectId'),
    body('chapterNumber')
        .notEmpty().withMessage('Chapter number is required')
        .isInt({ min: 1 }).withMessage('Chapter number must be a positive integer'),
    body('title')
        .optional()
        .isString().withMessage('Title must be a String')
        .trim()
        .notEmpty().withMessage('Title cannot be empty'),
    body('textContent')
        .notEmpty().withMessage('Chapter content is required')
        .isString().withMessage('Chapter content must be a string'),
    body('wordCount')
        .optional()
        .isInt({ min: 0 }).withMessage('Word Count must be non-negative integer'),
    body('createdBy')
        .notEmpty().withMessage('Author ID is required')
        .isMongoId().withMessage('Author ID must be a valid MongoDB ObjectId')
];

const validateChapterUpdates = [
    body('title')
        .optional()
        .isString().withMessage('Title must be a String')
        .trim()
        .notEmpty().withMessage('Title cannot be empty'),
    body('textContent')
        .optional()
        .isString().withMessage('Content must be string')
        .trim()
        .notEmpty().withMessage('Content cannot be empty'),
    body('wordCount')
        .optional()
        .isInt({ min: 0 }).withMessage('Word Count must be non-negative integer')
];

module.exports = { validateChapter, validateChapterUpdates };