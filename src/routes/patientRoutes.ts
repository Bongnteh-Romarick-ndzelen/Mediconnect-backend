import express from 'express';
import { PatientController } from '../controllers/patientController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  updatePatientSchema,
  listPatientsSchema,
  getPatientSchema
} from '../schemas/validation.js';

const router = express.Router();

// Public routes
router.get('/:id', validate(getPatientSchema), PatientController.getPatient);

// Protected routes - only authenticated users
router.get('/me', authenticate, PatientController.getCurrentPatient);
router.put('/me', authenticate, validate(updatePatientSchema), PatientController.updateCurrentPatient);

// Admin/Support routes
router.get('/', authenticate, authorize('ADMIN', 'SUPPORT'), validate(listPatientsSchema), PatientController.listPatients);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPPORT'), validate(updatePatientSchema), PatientController.updatePatient);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPPORT'), PatientController.deletePatient);

export default router;
