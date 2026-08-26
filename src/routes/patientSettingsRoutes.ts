import express from 'express';
import { PatientSettingsController } from '../controllers/patientSettingsController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { patientSettingsSchema } from '../schemas/validation.js';

const router = express.Router();

router.get('/me/settings', authenticate, authorize('PATIENT'), PatientSettingsController.getPatientSettings);
router.put('/me/settings', authenticate, authorize('PATIENT'), validate(patientSettingsSchema), PatientSettingsController.updatePatientSettings);

export default router;
