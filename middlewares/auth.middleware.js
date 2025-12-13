import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const authMiddleware = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) return res.redirect('/login');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.redirect('/login');

        req.user = user; // Make user available to routes and views
        res.locals.user = user; // Make user available to EJS templates
        next;
    } catch (err) {
        console.error(err);
        return res.redirect('/login');
    }
};

// Admin only middleware
export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).send('Access Denied: Admins Only');
    }
    next;
};
