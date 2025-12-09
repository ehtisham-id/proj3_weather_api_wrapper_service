import redisClient from '../config/redis.config.js';
import pino from 'pino';

const logger = pino();

const get = async (key) => {
    try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        logger.error(`Error getting cache for key ${key}: ${error.message}`);
        return null;
    }
}

const set = async (key, value, expirationInSeconds) => {
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', expirationInSeconds);
    } catch (error) {
        logger.error(`Error setting cache for key ${key}: ${error.message}`);
    }
}

const getCacheKey = (location, type = 'current', units = 'metric') => {
    return `weather:${type}:${location.toLowerCase()}:${units}`;
};

module.exports = { get, set, getCacheKey };