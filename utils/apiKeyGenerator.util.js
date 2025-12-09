import crypto from 'crypto';

function generateApiKey() {
    const apiKey = crypto.randomBytes(32).toString('hex');
    return `wapi_${apiKey}`;
}

export default generateApiKey;