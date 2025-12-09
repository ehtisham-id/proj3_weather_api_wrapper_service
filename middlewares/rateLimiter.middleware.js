import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.config.js";
import pino from "pino";

const logger = pino();

const ipRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS_IP),
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json({ message: options.message });
        next;
    },
    ...(client && {
        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        }),
    })
});

const apiKeyRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS_IP),
    keyGenerator: (req) => req.headers['x-api-key'],
    message: "Too many requests with this API key, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json({ message: options.message });
        next;
    },
    ...(client && {
        store: new RedisStore({
            sendCommand: (...args) => client.sendCommand(args)
        })
    })
});


module.exports = { ipRateLimiter, apiKeyRateLimiter };