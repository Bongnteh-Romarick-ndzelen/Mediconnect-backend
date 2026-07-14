import express from 'express';
import { AppointmentController } from '../controllers/appointmentController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  getAppointmentSchema,
  listAppointmentsSchema,
  cancelAppointmentSchema
} from '../schemas/validation.js';

const router = express.Router();

// Protected routes - create appointment (patient only)
router.post('/', authenticate, authorize('PATIENT'), validate(createAppointmentSchema), AppointmentController.createAppointment);

// Get appointment by ID
router.get('/:id', authenticate, validate(getAppointmentSchema), AppointmentController.getAppointment);

// List appointments
router.get('/', authenticate, validate(listAppointmentsSchema), AppointmentController.listAppointments);

// Update appointment
router.put('/:id', authenticate, validate(updateAppointmentSchema), AppointmentController.updateAppointment);

// Cancel appointment
router.post('/:id/cancel', authenticate, validate(cancelAppointmentSchema), AppointmentController.cancelAppointment);

// Get appointment history
router.get('/:id/history', authenticate, AppointmentController.getAppointmentHistory);

export default router;
