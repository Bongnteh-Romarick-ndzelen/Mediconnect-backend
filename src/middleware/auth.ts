import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ExtendedPrismaClient } from '../config/database.js';
import type { TokenPayload } from '../types/auth.types.js';
import { AppError } from './errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

const prisma = new ExtendedPrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from multiple sources
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      throw new AppError(
        CONSTANTS.MESSAGES.UNAUTHORIZED_ACCESS,
        CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        CONSTANTS.ERROR_CODES.AUTH_REQUIRED
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    
    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        isLocked: true,
      }
    });

    if (!user) {
      throw new AppError(
        'User not found',
        CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        CONSTANTS.ERROR_CODES.USER_NOT_FOUND
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Account deactivated',
        CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        CONSTANTS.ERROR_CODES.ACCOUNT_DEACTIVATED
      );
    }

    if (user.isLocked) {
      throw new AppError(
        'Account locked',
        CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        CONSTANTS.ERROR_CODES.ACCOUNT_LOCKED
      );
    }

    // Check if email is verified (except for admins)
    if (!user.isVerified && user.role !== CONSTANTS.ROLES.ADMIN) {
      throw new AppError(
        'Email not verified',
        CONSTANTS.HTTP_STATUS.FORBIDDEN,
        CONSTANTS.ERROR_CODES.EMAIL_NOT_VERIFIED
      );
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Log successful authentication
    logger.debug(`User ${user.id} authenticated successfully`);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: CONSTANTS.ERROR_CODES.TOKEN_EXPIRED,
          message: 'Token expired. Please refresh.',
        }
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: CONSTANTS.ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid token.',
        }
      });
    }
    
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(
        CONSTANTS.MESSAGES.UNAUTHORIZED_ACCESS,
        CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        CONSTANTS.ERROR_CODES.AUTH_REQUIRED
      );
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} attempted to access ${roles} resource`);
      throw new AppError(
        CONSTANTS.MESSAGES.FORBIDDEN_ACCESS,
        CONSTANTS.HTTP_STATUS.FORBIDDEN,
        CONSTANTS.ERROR_CODES.FORBIDDEN
      );
    }
    
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken || 
      req.headers.authorization?.substring(7);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true
          }
        });
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Ignore invalid token for optional auth
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const checkOwnership = (getResourceId: (req: Request) => string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const resourceId = getResourceId(req);
      
      if (!userId) {
        throw new AppError(
          CONSTANTS.MESSAGES.UNAUTHORIZED_ACCESS,
          CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
          CONSTANTS.ERROR_CODES.AUTH_REQUIRED
        );
      }

      // Check if user owns the resource
      // This is a generic check - specific implementations should be in controllers
      const resource = await prisma.$queryRaw`
        SELECT * FROM "Appointment" 
        WHERE id = ${resourceId} AND patient_id = ${userId}
      `;
      
      if (!resource) {
        throw new AppError(
          'Resource not found or access denied',
          CONSTANTS.HTTP_STATUS.FORBIDDEN,
          CONSTANTS.ERROR_CODES.FORBIDDEN
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};