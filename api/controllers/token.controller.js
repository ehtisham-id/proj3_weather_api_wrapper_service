import generateApiKey from 'utils/apiKey.util.js';
import ApiKey from 'models/ApiKey.js';
import User from 'models/User.js';
import Token from 'models/Token.js';

const generateAPIController = (req, res) => {
    try {
        const apiKey = generateApiKey();
        const userId = req.user.id;
        const newApiKey = new ApiKey({
            key: apiKey,
            user: userId,
        });
        newApiKey.save();
        res.status(200).json({ message: 'API key generated successfully', apiKey: apiKey });
    } catch (error) {
        
    }
};

export default {generateAPIController};