import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Custom format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Create logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  defaultMeta: { 
    service: 'mediconnect-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.simple()
    ),
  }));
}

// Create a stream object for Morgan integration
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Utility functions for logging
export const logError = (message: string, error?: any) => {
  logger.error(message, { 
    error: error?.message || error,
    stack: error?.stack,
    ...(error?.details && { details: error.details }),
  });
};

export const logWarning = (message: string, data?: any) => {
  logger.warn(message, data);
};

export const logInfo = (message: string, data?: any) => {
  logger.info(message, data);
};

export const logDebug = (message: string, data?: any) => {
  logger.debug(message, data);
};

// Performance logging
export const logPerformance = (operation: string, startTime: number) => {
  const duration = Date.now() - startTime;
  if (duration > 1000) {
    logger.warn(`Slow operation: ${operation} took ${duration}ms`);
  } else {
    logger.debug(`Operation: ${operation} took ${duration}ms`);
  }
  return duration;
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
    });
  });
  
  next();
};

export default logger;