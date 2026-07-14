import type { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patientService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class PatientController {
  static async getCurrentPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const patient = await PatientService.getPatient(userId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }

  static async getPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getPatientById(id);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }

  static async listPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const result = await PatientService.listPatients(query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrentPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const patient = await PatientService.updatePatient(userId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }

  static async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getPatientById(id);
      const updated = await PatientService.updatePatient(patient.userId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getPatientById(id);
      const result = await PatientService.deletePatient(patient.userId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
