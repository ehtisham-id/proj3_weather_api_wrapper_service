import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const apiKeySchema = new mongoose.Schema({
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
    hashedKey: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

apiKeySchema.pre('save', async function (next) {
    if (this.isModified('hashedKey')) {
        const salt = await bcrypt.genSalt(10);
        this.hashedKey = await bcrypt.hash(this.hashedKey, salt);
    }
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
export default ApiKey;