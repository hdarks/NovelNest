const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Author = require('../models/Author');

const protectUser = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized as User');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('No token, authorization denied');
    }
});

const protectAuthor = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization?.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== 'author') return res.status(403).json({ message: 'Access denied: Not an author' });

            const author = await Author.findById(decoded.id).select('-password');
            if (!author) throw new Error('Author not found');

            req.user = author;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized as Author');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('No token, authorization denied');
    }
});

const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            res.status(403);
            throw new Error(`Access denied for role: ${req.user.role}`);
        }
        next();
    };
};

module.exports = { protectAuthor, protectUser, checkRole }