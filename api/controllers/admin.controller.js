import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';

const getStatsController = async (req, res) => {
    try {
        // Get all ApiKeys with populated user data
        const apiKeys = await ApiKey.find()
            .populate('user', 'email role')
            .lean();

        // Group by user
        const usersWithTokens = apiKeys.reduce((acc, apiKey) => {
            const userId = apiKey.user._id;
            if (!acc[userId]) {
                acc[userId] = {
                    email: apiKey.user.email,
                    role: apiKey.user.role,
                    tokens: []
                };
            }
            acc[userId].tokens.push(apiKey.hashedKey);
            return acc;
        }, {});

        console.log(Object.values(usersWithTokens));
        res.status(200).json(Object.values(usersWithTokens));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};



const grantAdminController = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({_id: id});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }  
        user.role = 'admin';
        await user.save();
        res.status(200).json({ message: 'User granted admin privileges' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    } 
}

export default { getStatsController, grantAdminController };