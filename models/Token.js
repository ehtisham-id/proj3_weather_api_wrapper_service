import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['reset', 'verify'],
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
    }
}, {timestamps: true});

tokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model("Token", tokenSchema);

export default Token;