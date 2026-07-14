import express from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema
} from '../schemas/validation';

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

export default router;