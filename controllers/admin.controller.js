import User from '../models/user.model.js';
import pino from 'pino';

exports.showAdminPanel = async (req, res,) => {
    try {
        const users = await User.find().select('email apiKey createdAt');
        res.render('admin', { users });
    } catch (err) {
        logger.error(`Error fetching users for admin panel: ${err.message}`);
        res.status(500).send('Internal Server Error');
    }
};