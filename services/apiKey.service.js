import crypto from 'crypto';
import User from '../models/User.js';

const generateApiKey = () => 'wapi_' + crypto.randomBytes(32).toString('hex');

const assignApiKeyToUser = async (userId) => {
    const apiKey = generateApiKey();
    await User.findByIdAndUpdate(userId, { apiKey });
    return apiKey;
};

export default { generateApiKey, assignApiKeyToUser };