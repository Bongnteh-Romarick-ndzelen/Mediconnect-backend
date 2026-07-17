import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public details?: any;

  constructor(message: string, statusCode: number, errorCode?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (
  err: Error | AppError | Prisma.PrismaClientKnownRequestError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    user: (req as any).user?.id,
  });

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMap: Record<string, { status: number; code: string; message: string }> = {
      'P2000': {
        status: CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        code: 'INVALID_DATA',
        message: 'Provided data is too long for the field',
      },
      'P2001': {
        status: CONSTANTS.HTTP_STATUS.NOT_FOUND,
        code: 'RECORD_NOT_FOUND',
        message: 'Record not found',
      },
      'P2002': {
        status: CONSTANTS.HTTP_STATUS.CONFLICT,
        code: 'DUPLICATE_ERROR',
        message: 'A record with this value already exists',
      },
      'P2003': {
        status: CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        code: 'FOREIGN_KEY_ERROR',
        message: 'Invalid reference to related record',
      },
      'P2011': {
        status: CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        code: 'NULL_CONSTRAINT',
        message: 'Required field is null',
      },
      'P2014': {
        status: CONSTANTS.HTTP_STATUS.CONFLICT,
        code: 'RELATION_ERROR',
        message: 'The change would violate required relation',
      },
      'P2025': {
        status: CONSTANTS.HTTP_STATUS.NOT_FOUND,
        code: 'RECORD_NOT_FOUND',
        message: 'Record not found',
      },
    };

    const error = errorMap[err.code];
    if (error) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: err.meta,
        },
      });
    }

    return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: CONSTANTS.ERROR_CODES.DATABASE_ERROR,
        message: 'Database error occurred',
        details: process.env.NODE_ENV === 'development' ? err.meta : undefined,
      },
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode || 'APP_ERROR',
        message: err.message,
        details: err.details,
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: CONSTANTS.ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid authentication token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: CONSTANTS.ERROR_CODES.TOKEN_EXPIRED,
        message: 'Authentication token expired',
      },
    });
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerErrors: Record<string, { status: number; message: string }> = {
      'LIMIT_FILE_SIZE': {
        status: CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        message: `File too large. Max size: ${CONSTANTS.FILE.MAX_SIZE / (1024 * 1024)}MB`,
      },
      'LIMIT_FILE_COUNT': {
        status: CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        message: `Too many files. Max: ${CONSTANTS.FILE.MAX_FILES}`,
      },
      'LIMIT_UNEXPECTED_FILE': {
        status: CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        message: 'Unexpected file field',
      },
    };

    const error = multerErrors[err.code];
    if (error) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: 'FILE_UPLOAD_ERROR',
          message: error.message,
        },
      });
    }
  }

  // Default error response
  const statusCode = (err as any).statusCode || CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production'
    ? CONSTANTS.MESSAGES.SOMETHING_WRONG
    : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
      message: message,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: err.stack,
      }),
    },
  });
};

export default errorHandler;

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

// Async wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};