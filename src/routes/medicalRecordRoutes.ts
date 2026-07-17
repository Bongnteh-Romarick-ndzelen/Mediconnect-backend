import express from 'express';
import { MedicalRecordController } from '../controllers/medicalRecordController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
  getMedicalRecordSchema,
  listMedicalRecordsSchema
} from '../schemas/validation.js';

const router = express.Router();

// Create medical record (provider only)
router.post('/', authenticate, authorize('PROVIDER', 'ADMIN', 'SUPPORT'), validate(createMedicalRecordSchema), MedicalRecordController.createMedicalRecord);

// Get single medical record
router.get('/:id', authenticate, validate(getMedicalRecordSchema), MedicalRecordController.getMedicalRecord);

// List medical records
router.get('/', authenticate, validate(listMedicalRecordsSchema), MedicalRecordController.listMedicalRecords);

// Update medical record (provider only)
router.put('/:id', authenticate, authorize('PROVIDER', 'ADMIN', 'SUPPORT'), validate(updateMedicalRecordSchema), MedicalRecordController.updateMedicalRecord);

// Delete medical record (provider only)
router.delete('/:id', authenticate, authorize('PROVIDER', 'ADMIN', 'SUPPORT'), MedicalRecordController.deleteMedicalRecord);

export default router;
