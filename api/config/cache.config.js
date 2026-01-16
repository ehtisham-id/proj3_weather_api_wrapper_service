import Redis from "ioredis";
import pino from "pino";

const logger = pino();

const redisClient = new Redis(process.env.REDIS_URL, {
    retryStrategy(times) {
        const delay = Math.min(times * 2000, 15000);
        logger.warn(`Redis reconnect attempt #${times}, retrying in ${delay / 1000}s`);
        return delay;
    }
});

redisClient.on('connect', () => { logger.info('Connected to Redis server'); });
redisClient.on('error', (error) => { logger.error(`Redis error: ${error.message}`); });
redisClient.on('ready', () => logger.info('Redis ready'));

export default redisClient;
