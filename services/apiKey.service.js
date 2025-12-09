import crypto from 'crypto';
import User from '../models/user.model.js';

const generateApiKey = () => 'wapi_' + crypto.randomBytes(32).toString('hex');

const assignApiKeyToUser = async (userId) => {
    const apiKey = generateApiKey();
    await User.findByIdAndUpdate(userId, { apiKey });
    return apiKey;
};

module.exports = { generateApiKey, assignApiKeyToUser };