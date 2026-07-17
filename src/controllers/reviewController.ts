import type { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class ReviewController {
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = (req as any).user?.id;
      const review = await ReviewService.createReview(patientId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  static async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const review = await ReviewService.getReview(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  static async listReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const result = await ReviewService.listReviews(query);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const patientId = (req as any).user?.id;
      const review = await ReviewService.updateReview(id, patientId, req.body);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  static async respondToReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const providerId = (req as any).user?.id;
      const { providerResponse } = req.body;
      const review = await ReviewService.respondToReview(id, providerId, providerResponse);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const result = await ReviewService.deleteReview(id, userId, userRole);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
