import app from '../app.js';
import connectDB from '../api/config/database.config.js';
//import redisClient from '../config/redis.config.js';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const PORT = process.env.PORT || 3000;

connectDB();
// redisClient.connect().then(() => {
//   logger.info('Connected to Redis');
// }).catch((err) => {
//   logger.error('Redis connection error:', err);
// });

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 


