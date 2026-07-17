import type { Request, Response, NextFunction } from 'express';
import { MedicalRecordService } from '../services/medicalRecordService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class MedicalRecordController {
  static async createMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const record = await MedicalRecordService.createMedicalRecord(providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  static async getMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const record = await MedicalRecordService.getMedicalRecord(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  static async listMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const query = req.query as any;
      const result = await MedicalRecordService.listMedicalRecords(userId, userRole, query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const providerId = (req as any).user?.id;
      const record = await MedicalRecordService.updateMedicalRecord(id, providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const providerId = (req as any).user?.id;
      const result = await MedicalRecordService.deleteMedicalRecord(id, providerId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
