import type { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class AdminController {
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const result = await AdminService.listUsers(query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUser(id);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AdminService.updateUser(id, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteUser(id);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async listAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const result = await AdminService.listAppointments(query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await AdminService.updateAppointment(id, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as any;
      const stats = await AdminService.getStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
