import type { Request, Response, NextFunction } from 'express';
import { FileUploadService } from '../services/fileUploadService.js';
import { SupabaseStorageService } from '../services/supabaseStorageService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class FileUploadController {
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!req.file) {
        throw new AppError('No file uploaded', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'NO_FILE_UPLOADED');
      }

      const folder = req.body.type?.toLowerCase() || 'others';
      const uploadResult = await SupabaseStorageService.uploadFile(req.file, folder);

      const metadata = {
        type: req.body.type || 'OTHER',
        description: req.body.description,
        isConfidential: req.body.isConfidential === 'true',
        patientId: req.body.patientId
      };

      const result = {
        ...uploadResult,
        userId,
        type: metadata.type,
        description: metadata.description,
        isConfidential: metadata.isConfidential,
        patientId: metadata.patientId
      };

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
