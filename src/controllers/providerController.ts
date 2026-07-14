import type { Request, Response, NextFunction } from 'express';
import { ProviderService } from '../services/providerService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class ProviderController {
  static async getCurrentProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const provider = await ProviderService.getProvider(userId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: provider });
    } catch (error) {
      next(error);
    }
  }

  static async getProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const provider = await ProviderService.getProviderById(id);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: provider });
    } catch (error) {
      next(error);
    }
  }

  static async listProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const result = await ProviderService.listProviders(query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrentProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const provider = await ProviderService.updateProvider(userId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: provider });
    } catch (error) {
      next(error);
    }
  }

  static async updateProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const provider = await ProviderService.getProviderById(id);
      const updated = await ProviderService.updateProvider(provider.userId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async createAvailabilitySlot(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const slot = await ProviderService.createAvailabilitySlot(providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: slot });
    } catch (error) {
      next(error);
    }
  }

  static async updateAvailabilitySlot(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const { id } = req.params;
      const slot = await ProviderService.updateAvailabilitySlot(id, providerId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: slot });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAvailabilitySlot(req: Request, res: Response, next: NextFunction) {
    try {
      const providerId = (req as any).user?.id;
      const { id } = req.params;
      const result = await ProviderService.deleteAvailabilitySlot(id, providerId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProviderAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query as any;
      const slots = await ProviderService.getProviderAvailability(id, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: slots });
    } catch (error) {
      next(error);
    }
  }
}
