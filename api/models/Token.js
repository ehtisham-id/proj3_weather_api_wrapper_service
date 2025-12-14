import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const tokenSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

const Token = mongoose.model('Token', tokenSchema);
export default Token;