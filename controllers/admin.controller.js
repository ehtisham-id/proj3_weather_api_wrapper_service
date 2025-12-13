import User from '../models/User.js';
import pino from 'pino';

const logger = pino();

export const showAdminPanel = async (req, res) => {
    try {
        const users = await User.find().select('email createdAt');
        res.render('admin', { users });
    } catch (err) {
        logger.error(`Error fetching users for admin panel: ${err.message}`);
        res.status(500).send('Internal Server Error');
    }
};