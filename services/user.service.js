import User from '../models/User.js';

const getAllUsers = async () => {
    return await User.find({}, 'email apikey creaetedAt');
}

const updateUserStatus = async (userId, status) => {
    return await User.findByIdAndUpdate(userId, { status }, { new: true });
}

export default {
    getAllUsers,
    updateUserStatus
};