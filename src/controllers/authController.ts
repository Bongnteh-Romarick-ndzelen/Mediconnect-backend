import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import type { 
  RegisterInput, 
  LoginInput, 
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  RefreshTokenInput
} from '../types/auth.types.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  // ============================================
  // REGISTER
  // ============================================
  
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input: RegisterInput = req.body;
      
      const result = await AuthService.register(input);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input: LoginInput = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceInfo: req.headers['device-info']
      };
      
      const result = await AuthService.login(input);
      
      // Set tokens in HTTP-only cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================
  
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new AppError('Refresh token required', 401, 'REFRESH_TOKEN_REQUIRED');
      }
      
      const result = await AuthService.refreshToken(refreshToken);
      
      // Update access token cookie
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input: ForgotPasswordInput = req.body;
      
      await AuthService.forgotPassword(input);
      
      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // RESET PASSWORD
  // ============================================
  
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input: ResetPasswordInput = req.body;
      
      await AuthService.resetPassword(input);
      
      res.json({
        success: true,
        message: 'Password reset successful. Please login with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // VERIFY EMAIL
  // ============================================
  
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        throw new AppError('Verification token required', 400, 'TOKEN_REQUIRED');
      }
      
      await AuthService.verifyEmail(token);
      
      res.json({
        success: true,
        message: 'Email verified successfully. You can now login.'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // RESEND VERIFICATION EMAIL
  // ============================================
  
  static async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new AppError('Email required', 400, 'EMAIL_REQUIRED');
      }
      
      await AuthService.resendVerificationEmail(email);
      
      res.json({
        success: true,
        message: 'Verification email sent. Please check your inbox.'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const refreshToken = req.cookies.refreshToken;
      
      if (userId) {
        await AuthService.logout(userId, refreshToken);
      }
      
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      
      const input: ChangePasswordInput = req.body;
      
      await AuthService.changePassword(userId, input);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // GET CURRENT USER
  // ============================================
  
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          patient: true,
          provider: true
        }
      });
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();