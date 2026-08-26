import express from 'express';
import { ProviderSettingsController } from '../controllers/providerSettingsController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { providerSettingsSchema } from '../schemas/validation.js';

const router = express.Router();

router.get('/me/settings', authenticate, authorize('PROVIDER'), ProviderSettingsController.getProviderSettings);
router.put('/me/settings', authenticate, authorize('PROVIDER'), validate(providerSettingsSchema), ProviderSettingsController.updateProviderSettings);

export default router;
