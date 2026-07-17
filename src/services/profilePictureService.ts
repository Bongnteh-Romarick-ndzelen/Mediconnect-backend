import { SupabaseStorageService } from './supabaseStorageService.js';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import prisma from '../config/database.js';

export class ProfilePictureService {
  static async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_FILE_TYPE');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new AppError('File size too large. Maximum size is 5MB.', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'FILE_TOO_LARGE');
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (existingProfile?.avatar) {
      const oldFileName = existingProfile.avatar.split('/').pop();
      if (oldFileName) {
        try {
          await SupabaseStorageService.deleteFile(`profile-images/${oldFileName}`);
        } catch (error) {
          logger.warn('Failed to delete old profile picture:', error);
        }
      }
    }

    const uploadResult = await SupabaseStorageService.uploadFile(file, 'profile-images');

    await prisma.profile.update({
      where: { userId },
      data: {
        avatar: uploadResult.url
      }
    });

    return {
      avatar: uploadResult.url,
      fileName: uploadResult.fileName,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType
    };
  }

  static async deleteProfilePicture(userId: string) {
    const existingProfile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!existingProfile?.avatar) {
      throw new AppError('No profile picture to delete', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'NO_PROFILE_PICTURE');
    }

    const oldFileName = existingProfile.avatar.split('/').pop();
    if (oldFileName) {
      try {
        await SupabaseStorageService.deleteFile(`profile-images/${oldFileName}`);
      } catch (error) {
        logger.warn('Failed to delete old profile picture:', error);
      }
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        avatar: null
      }
    });

    return { message: 'Profile picture deleted successfully' };
  }
}
