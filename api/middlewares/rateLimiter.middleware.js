import rateLimit from "express-rate-limit";
import pino from "pino";

const logger = pino();

export const ipRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins default
    max: process.env.RATE_LIMIT_MAX_REQUESTS_IP,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ message: "Too many requests from this IP, please try again later." });
    },
});
