import express from 'express';
import { ProviderController } from '../controllers/providerController.js';
import { ProfilePictureController } from '../controllers/profilePictureController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../services/fileUploadService.js';
import {
  updateProviderSchema,
  listProvidersSchema,
  getProviderSchema,
  createAvailabilitySchema,
  updateAvailabilitySchema
} from '../schemas/validation.js';

const router = express.Router();

// Profile picture upload
router.post('/avatar', authenticate, upload.single('avatar'), ProfilePictureController.uploadProfilePicture);
router.delete('/avatar', authenticate, ProfilePictureController.deleteProfilePicture);

// Protected routes
router.get('/me', authenticate, authorize('PROVIDER'), ProviderController.getCurrentProvider);
router.put('/me', authenticate, authorize('PROVIDER'), validate(updateProviderSchema), ProviderController.updateCurrentProvider);
router.post('/me/availability', authenticate, authorize('PROVIDER'), validate(createAvailabilitySchema), ProviderController.createAvailabilitySlot);
router.put('/me/availability/:id', authenticate, authorize('PROVIDER'), validate(updateAvailabilitySchema), ProviderController.updateAvailabilitySlot);
router.delete('/me/availability/:id', authenticate, authorize('PROVIDER'), ProviderController.deleteAvailabilitySlot);

// Public routes
router.get('/:id', validate(getProviderSchema), ProviderController.getProvider);
router.get('/:id/availability', validate(getProviderSchema), ProviderController.getProviderAvailability);

// Public routes - list providers
router.get('/', validate(listProvidersSchema), ProviderController.listProviders);

// Admin routes
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateProviderSchema), ProviderController.updateProvider);

export default router;
