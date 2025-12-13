import crypto from 'crypto';

const generateApiKey = () => {
    const keyId = crypto.randomUUID();
    const keySecret = crypto.randomBytes(32).toString('hex');
    return `${keyId}:${keySecret}`;
}

export default generateApiKey;