import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (payload) => {
    const id = crypto.randomUUID();
    const secret = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return `${id}:${secret}`;
}

export default generateToken;