import type { Request, Response, NextFunction } from 'express';
import { ProviderSettingsService } from '../services/providerSettingsService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class ProviderSettingsController {
  static async getProviderSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const settings = await ProviderSettingsService.getProviderSettings(providerId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateProviderSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const settings = await ProviderSettingsService.updateProviderSettings(providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}
