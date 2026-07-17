import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  adminListUsersSchema,
  adminUpdateUserSchema,
  adminListAppointmentsSchema,
  adminUpdateAppointmentSchema,
  adminStatsSchema
} from '../schemas/validation.js';

const router = express.Router();

// Stats
router.get('/stats', authenticate, authorize('ADMIN', 'SUPPORT'), validate(adminStatsSchema), AdminController.getStats);

// User Management
router.get('/users', authenticate, authorize('ADMIN', 'SUPPORT'), validate(adminListUsersSchema), AdminController.listUsers);
router.get('/users/:id', authenticate, authorize('ADMIN', 'SUPPORT'), AdminController.getUser);
router.put('/users/:id', authenticate, authorize('ADMIN', 'SUPPORT'), validate(adminUpdateUserSchema), AdminController.updateUser);
router.delete('/users/:id', authenticate, authorize('ADMIN'), AdminController.deleteUser);

// Appointment Management
router.get('/appointments', authenticate, authorize('ADMIN', 'SUPPORT'), validate(adminListAppointmentsSchema), AdminController.listAppointments);
router.put('/appointments/:id', authenticate, authorize('ADMIN', 'SUPPORT'), validate(adminUpdateAppointmentSchema), AdminController.updateAppointment);

export default router;
