import type { Request, Response, NextFunction } from 'express';
import { ProfilePictureService } from '../services/profilePictureService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import { upload } from '../services/fileUploadService.js';

export class ProfilePictureController {
  static async uploadProfilePicture(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      if (!req.file) {
        throw new AppError('No file uploaded', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'NO_FILE_UPLOADED');
      }

      const result = await ProfilePictureService.uploadProfilePicture(userId, req.file);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ 
        success: true, 
        message: 'Profile picture updated successfully',
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfilePicture(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await ProfilePictureService.deleteProfilePicture(userId);
      res.status(CONSTANTS.HTTP_STATUS.OK).json({ 
        success: true, 
        message: result.message 
      });
    } catch (error) {
      next(error);
    }
  }
}
