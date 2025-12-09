import User from '../models/user.model.js';

const getAllUsers = async () => {
    return await User.find({}, 'email apikey creaetedAt');
}

const updateUserStatus = async (userId, status) => {
    return await User.findByIdAndUpdate(userId, { status }, { new: true });
}

module.exports = {
    getAllUsers,
    updateUserStatus
};