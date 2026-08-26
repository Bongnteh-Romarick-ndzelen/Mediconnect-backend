import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  updateUserProfileSchema,
  toggleMfaSchema,
  updateUserSettingsSchema,
  auditLogSchema
} from '../schemas/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), AuthController.resendVerificationEmail);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/me', authenticate, validate(updateUserProfileSchema), AuthController.updateCurrentUser);
router.post('/mfa/toggle', authenticate, validate(toggleMfaSchema), AuthController.toggleMfa);
router.put('/me/settings', authenticate, validate(updateUserSettingsSchema), AuthController.updateCurrentUserSettings);
router.post('/audit/log', authenticate, validate(auditLogSchema), AuthController.createAuditLog);

export default router;