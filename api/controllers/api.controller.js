import generateApiKey from '../utils/apiKey.util.js';
import ApiKey from '../models/ApiKey.js';

const generateAPIController = async (req, res) => {
    try {
        const apiKey = generateApiKey();
        const [apiId, apiSecret] = apiKey.split(':');
        const newApiKey = new ApiKey({
            id : apiId,
            hashedKey: apiSecret,
            user: req.user,
        });

        await newApiKey.save();
        res.status(200).json({ message: 'API key generated successfully', apiKey: apiKey });
    } catch (error) {
        
    }
};

export default {generateAPIController};