import type { Request, Response, NextFunction } from 'express';
import { PatientSettingsService } from '../services/patientSettingsService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class PatientSettingsController {
  static async getPatientSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = (req as any).user?.id;
      const settings = await PatientSettingsService.getPatientSettings(patientId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updatePatientSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = (req as any).user?.id;
      const settings = await PatientSettingsService.updatePatientSettings(patientId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}
