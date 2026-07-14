import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { ZodError, z } from 'zod';
import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';
import { CONSTANTS } from '../config/constants';
import { logger } from '../utils/logger';

export const validate = (schema: z.ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Validation failed:', { errors, path: req.path });
        
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details: errors,
          }
        });
      }
      next(error);
    }
  };
};

export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid request body',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          }
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          }
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid path parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          }
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const idSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
  }),
});

export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: 'Start date must be before end date',
    path: ['startDate'],
  }),
});

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove potential XSS vectors
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script.*?>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = sanitize(obj[key]);
      }
      return result;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Rate limiting middleware (wrapper for express-rate-limit)
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || CONSTANTS.RATE_LIMIT.WINDOW_MS,
    max: options.max || CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later.',
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  });
  
  next();
};

// CORS middleware (wrapper)
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
};