import User from '../models/user.model.js';
import pino from 'pino';

const logger = pino();

exports.showDashboard = async (req, res) => {
    try { 
        const user = req.user;
        res.render('dashboard', { user });
    }catch (error) {
        logger.error(`Error rendering dashboard: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}

exports.generateApiKey = async (req, res) => {
    try {
        const user = req.user;

        user.apiKey = `wapi_${require('crypto').randomBytes(32).toString('hex')}`;
        await user.save();

        res.redirect('/dashboard');
    }catch (error) {
        logger.error(`Error generating API key: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}