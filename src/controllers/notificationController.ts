import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class NotificationController {
  static async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const notification = await NotificationService.getNotification(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const query = req.query as any;
      const result = await NotificationService.listNotifications(userId, userRole, query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const notification = await NotificationService.markAsRead(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const result = await NotificationService.markAllAsRead(userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const result = await NotificationService.deleteNotification(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const result = await NotificationService.deleteAllNotifications(userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
