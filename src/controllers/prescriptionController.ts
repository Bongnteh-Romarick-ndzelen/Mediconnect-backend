import type { Request, Response, NextFunction } from 'express';
import { PrescriptionService } from '../services/prescriptionService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class PrescriptionController {
  static async createPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const prescription = await PrescriptionService.createPrescription(providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: prescription });
    } catch (error) {
      next(error);
    }
  }

  static async getPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const prescription = await PrescriptionService.getPrescription(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: prescription });
    } catch (error) {
      next(error);
    }
  }

  static async listPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const query = req.query as any;
      const result = await PrescriptionService.listPrescriptions(userId, userRole, query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updatePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const providerId = (req as any).user?.id;
      const prescription = await PrescriptionService.updatePrescription(id, providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: prescription });
    } catch (error) {
      next(error);
    }
  }

  static async requestRefill(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patientId = (req as any).user?.id;
      const prescription = await PrescriptionService.requestRefill(id, patientId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: prescription });
    } catch (error) {
      next(error);
    }
  }
}
