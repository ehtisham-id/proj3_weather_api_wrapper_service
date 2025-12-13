import User from '../models/User.js';
import pino from 'pino';
import crypto from 'crypto';

const logger = pino();

export const showDashboard = async (req, res) => {
    try {
        const user = req.user;
        res.render('dashboard', { user });
    } catch (error) {
        logger.error(`Error rendering dashboard: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
};

export const generateApiKey = async (req, res) => {
    try {
        const user = req.user;

        user.apiKey = `wapi_${crypto.randomBytes(32).toString('hex')}`;
        await user.save();

        res.redirect('/dashboard');
    } catch (error) {
        logger.error(`Error generating API key: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
};