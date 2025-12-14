import express from 'express';
import apiRoutes from './routes/index.route.js';
import connectDB from './config/database.config.js';
import redisClient from './config/cache.config.js';

import { ipRateLimiter } from './middlewares/rateLimiter.middleware.js';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

connectDB();
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Redis connection error:', err);
});

router.use(express.json());
router.use('/v1', ipRateLimiter, apiRoutes);

export default router;