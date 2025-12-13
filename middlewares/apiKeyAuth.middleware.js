import { ApiKey } from '../models/ApiKey.js';
import pino from 'pino';

const logger = pino();

export default async function apiKeyAuth(req, res, next) {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) {
            return res.status(401).json({ message: 'API key is missing' });
        }

        if (!/^wapi_[a-f0-9]{64}$/i.test(apiKey)) {
            return res.status(400).json({ message: 'Invalid API key format' });
        }

        const keyRecord = await ApiKey.findOne({ key: apiKey });
        if (!keyRecord) {
            return res.status(401).json({ message: 'Invalid API key' });
        }

        if (!keyRecord.isActive) {
            return res.status(403).json({ message: 'API key is inactive' });
        }

        req.apiKeyRecord = keyRecord;
        next;
    } catch (err) {
        logger.error(`API Key Auth Middleware Error: ${err.message}`);
        next;
    }
}