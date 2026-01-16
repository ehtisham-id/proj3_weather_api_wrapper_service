import redisClient from '../config/cache.config.js';
import pino from 'pino';

const logger = pino();

const getCache = async (key) => {
    try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        logger.error(`Error getting cache for key ${key}: ${error.message}`);
        return null;
    }
}

const setCache = async (key, value, expirationInSeconds=process.env.CACHE_EXPIRATION_SECONDS) => {
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', expirationInSeconds);
    } catch (error) {
        logger.error(`Error setting cache for key ${key}: ${error.message}`);
    }   
}

const getCacheKey = (latitude, longitude, type = 'current') => {
    return `weather:${type}:${latitude}:${longitude}`;
};

export default {getCache , setCache , getCacheKey};