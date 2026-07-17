import express from 'express';
import { PrescriptionController } from '../controllers/prescriptionController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  getPrescriptionSchema,
  listPrescriptionsSchema,
  requestRefillSchema
} from '../schemas/validation.js';

const router = express.Router();

// Create prescription (provider only)
router.post('/', authenticate, authorize('PROVIDER', 'ADMIN', 'SUPPORT'), validate(createPrescriptionSchema), PrescriptionController.createPrescription);

// Get single prescription
router.get('/:id', authenticate, validate(getPrescriptionSchema), PrescriptionController.getPrescription);

// List prescriptions
router.get('/', authenticate, validate(listPrescriptionsSchema), PrescriptionController.listPrescriptions);

// Update prescription (provider only)
router.put('/:id', authenticate, authorize('PROVIDER', 'ADMIN', 'SUPPORT'), validate(updatePrescriptionSchema), PrescriptionController.updatePrescription);

// Request refill (patient only)
router.post('/:id/refill', authenticate, authorize('PATIENT'), validate(requestRefillSchema), PrescriptionController.requestRefill);

export default router;
