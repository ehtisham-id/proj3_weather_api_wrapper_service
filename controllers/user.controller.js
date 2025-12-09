import userService from '../services/user.service.js';
import apiKeyService from '../services/apiKey.service.js';

export const dashboard = async (req, res) => {
    const user = req.user; // JWT middleware
    const apiKey = user.apiKey || await apiKeyService.assignApiKeyToUser(user._id);
    res.render('dashboard', { user, apiKey });
};

export const adminPanel = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.render('admin', { users });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
