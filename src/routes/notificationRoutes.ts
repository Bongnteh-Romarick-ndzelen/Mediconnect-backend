import express from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  listNotificationsSchema,
  markNotificationReadSchema,
  markAllNotificationsReadSchema
} from '../schemas/validation.js';

const router = express.Router();

// Get single notification
router.get('/:id', authenticate, validate(markNotificationReadSchema), NotificationController.getNotification);

// List notifications
router.get('/', authenticate, validate(listNotificationsSchema), NotificationController.listNotifications);

// Mark notification as read
router.patch('/:id/read', authenticate, validate(markNotificationReadSchema), NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticate, NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticate, validate(markNotificationReadSchema), NotificationController.deleteNotification);

// Delete all notifications
router.delete('/', authenticate, NotificationController.deleteAllNotifications);

export default router;
