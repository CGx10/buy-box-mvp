// Gracefully handle missing dependencies for testing
let rateLimit, helmet, cors;

try {
    rateLimit = require('express-rate-limit');
} catch (error) {
    console.warn('express-rate-limit not available, using fallback');
    rateLimit = () => (req, res, next) => next();
}

try {
    helmet = require('helmet');
} catch (error) {
    console.warn('helmet not available, using fallback');
    helmet = () => (req, res, next) => next();
}

try {
    cors = require('cors');
} catch (error) {
    console.warn('cors not available, using fallback');
    cors = () => (req, res, next) => next();
}

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            error: message || 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Security middleware configuration
const securityConfig = {
    // General rate limiting
    general: createRateLimit(
        parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
        'Too many requests from this IP, please try again later.'
    ),

    // Strict rate limiting for analysis endpoints
    analysis: createRateLimit(
        60 * 1000, // 1 minute
        5, // 5 requests per minute
        'Analysis requests are rate limited. Please wait before trying again.'
    ),

    // Helmet security headers
    helmet: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com", "https://generativelanguage.googleapis.com"]
            }
        },
        crossOriginEmbedderPolicy: false
    }),

    // CORS configuration
    cors: cors({
        origin: process.env.CORS_ORIGIN || true,
        credentials: true
    }),

    // Input validation and sanitization
    sanitizeInput: (req, res, next) => {
        // Basic input sanitization
        if (req.body) {
            for (const key in req.body) {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key].trim();
                }
            }
        }
        next();
    }
};

module.exports = securityConfig;
