const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'buybox-generator' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requestCount: 0,
            averageResponseTime: 0,
            errorCount: 0,
            memoryUsage: process.memoryUsage()
        };
    }

    recordRequest(responseTime) {
        this.metrics.requestCount++;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime + responseTime) / 2;
    }

    recordError() {
        this.metrics.errorCount++;
    }

    getMetrics() {
        return {
            ...this.metrics,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };
    }
}

const performanceMonitor = new PerformanceMonitor();

module.exports = {
    logger,
    performanceMonitor
};
