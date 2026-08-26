import type { User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { 
  RegisterInput, 
  LoginInput, 
  TokenPayload,
  AuthResponse,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput
} from '../types/auth.types.js';
import { emailService } from './emailService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import prisma from '../config/database.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

export class AuthService {
  // ============================================
  // REGISTRATION
  // ============================================
  
  static async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() }
      });

      if (existingUser) {
        throw new AppError('User already exists', 409, 'USER_EXISTS');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

      // Create user with profile and role-specific data
      const user = await prisma.$transaction(async (tx) => {
        // Create base user
        const newUser = await tx.user.create({
          data: {
            email: input.email.toLowerCase(),
            password: hashedPassword,
            role: input.role || 'PATIENT',
            isVerified: false,
            isActive: true,
            profile: {
              create: {
                firstName: input.firstName,
                lastName: input.lastName,
                phoneNumber: input.phoneNumber,
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
              }
            }
          },
          include: {
            profile: true
          }
        });

        // Create role-specific data
        if (input.role === 'PATIENT' || !input.role) {
          await tx.patient.create({
            data: {
              userId: newUser.id,
              allergies: input.allergies || [],
              chronicConditions: input.chronicConditions || [],
            }
          });
        } else if (input.role === 'PROVIDER') {
          // Validate provider-specific fields
          if (!input.licenseNumber || !input.specialty || !input.hospital) {
            throw new AppError(
              'Provider registration requires licenseNumber, specialty, and hospital',
              400,
              'INVALID_PROVIDER_DATA'
            );
          }

          await tx.provider.create({
            data: {
              userId: newUser.id,
              licenseNumber: input.licenseNumber,
              specialty: input.specialty as any,
              hospital: input.hospital,
              yearsOfExperience: input.yearsOfExperience,
              certifications: input.certifications || [],
              consultationFee: input.consultationFee || 0,
              isAvailable: true,
            }
          });
        }

        return newUser;
      });

      // Generate verification token
      const verificationToken = AuthService.generateVerificationToken();
      
      // Save verification token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, verificationToken, user.profile?.firstName);
      } catch (emailError) {
        logger.warn('Verification email failed:', emailError);
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user.id, user.email, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profile: user.profile ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phoneNumber: user.profile.phoneNumber,
          } : undefined
        },
        ...tokens
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : 'Registration failed';
      logger.error('Registration error:', error);
      throw new AppError(message, 500, 'REGISTRATION_FAILED');
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  
  static async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
        include: {
          profile: true,
          patient: true,
          provider: true
        }
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Check if account is locked
      if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
        const minutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
        throw new AppError(
          `Account locked. Try again in ${minutes} minutes`,
          401,
          'ACCOUNT_LOCKED'
        );
      }

      // Check if account is active
      if (!user.isActive) {
        throw new AppError('Account deactivated', 401, 'ACCOUNT_DEACTIVATED');
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        await AuthService.handleFailedLogin(user.id);
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Check if email is verified
      if (!user.isVerified) {
        // Resend verification email
        const verificationToken = AuthService.generateVerificationToken();
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationToken,
            verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        });
        await emailService.sendVerificationEmail(
          user.email,
          verificationToken,
          user.profile?.firstName
        );
        throw new AppError(
          'Please verify your email. A new verification link has been sent.',
          403,
          'EMAIL_NOT_VERIFIED'
        );
      }

      // Reset failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: 0,
          lockUntil: null,
          isLocked: false,
          lastLogin: new Date()
        }
      });

      // Generate tokens
      const tokens = AuthService.generateTokens(user.id, user.email, user.role);

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          deviceInfo: input.deviceInfo,
          lastActivity: new Date()
        }
      });

      // Log login
      await AuthService.logActivity(user.id, 'LOGIN', true);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profile: user.profile ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phoneNumber: user.profile.phoneNumber,
          } : undefined
        },
        ...tokens
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Login failed', 500, 'LOGIN_FAILED');
    }
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================
  
  static generateTokens(userId: string, email: string, role: Role) {
    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as TokenPayload;

      // Check if session exists and is valid
      const session = await prisma.session.findUnique({
        where: { token: refreshToken }
      });

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        throw new AppError('Invalid session', 401, 'INVALID_SESSION');
      }

      // Update session last activity
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivity: new Date() }
      });

      // Generate new access token
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
      }

      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }
      throw error;
    }
  }

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================
  
  static async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = AuthService.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.profile?.firstName
    );
  }

  static async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: input.token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid or expired token', 400, 'INVALID_RESET_TOKEN');
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new AppError('Passwords do not match', 400, 'PASSWORD_MISMATCH');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        lastPasswordChange: new Date()
      }
    });

    // Invalidate all sessions
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true, revokedReason: 'PASSWORD_CHANGE' }
    });

    // Log password change
    await AuthService.logActivity(user.id, 'UPDATE', true);
  }

  static async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new AppError('Passwords do not match', 400, 'PASSWORD_MISMATCH');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date()
      }
    });

    // Invalidate all sessions except current
    // (Current session will be handled by logout/refresh)
  }

  // ============================================
  // EMAIL VERIFICATION
  // ============================================
  
  static async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
    }

    // Generate new verification token
    const verificationToken = AuthService.generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    await emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.profile?.firstName
    );
  }

  // ============================================
  // LOGOUT
  // ============================================
  
  static async logout(userId: string, refreshToken?: string): Promise<void> {
    // Revoke specific session if refresh token provided
    if (refreshToken) {
      await prisma.session.updateMany({
        where: {
          token: refreshToken,
          userId
        },
        data: {
          isRevoked: true,
          revokedReason: 'LOGOUT'
        }
      });
    } else {
      // Revoke all sessions
      await prisma.session.updateMany({
        where: { userId },
        data: {
          isRevoked: true,
          revokedReason: 'LOGOUT_ALL'
        }
      });
    }

    await AuthService.logActivity(userId, 'LOGOUT', true);
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  
  static generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  static generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  private static async handleFailedLogin(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const failedAttempts = (user.failedAttempts || 0) + 1;
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    const lockDuration = parseInt(process.env.LOCK_DURATION_MINUTES || '30');

    const updateData: any = {
      failedAttempts
    };

    if (failedAttempts >= maxAttempts) {
      updateData.isLocked = true;
      updateData.lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    await AuthService.logActivity(userId, 'UPDATE', false);
  }

  static async logActivity(userId: string, action: string, success: boolean, details?: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: action as any,
        entityType: 'USER',
        entityId: userId,
        success,
        details: {
          timestamp: new Date().toISOString(),
          ...(details ? { message: details } : {})
        }
      }
    });
  }
}

export default new AuthService();