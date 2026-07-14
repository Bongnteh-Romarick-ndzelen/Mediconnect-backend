import type { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class AppointmentController {
  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = (req as any).user?.id;
      const appointment = await AppointmentService.createAppointment(patientId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const appointment = await AppointmentService.getAppointment(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  static async listAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const query = req.query as any;
      const result = await AppointmentService.listAppointments(userId, userRole, query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const appointment = await AppointmentService.updateAppointment(id, userId, userRole, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const appointment = await AppointmentService.cancelAppointment(id, userId, userRole, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointmentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await AppointmentService.getAppointmentHistory(id);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}
