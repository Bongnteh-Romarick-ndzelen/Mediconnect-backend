import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../middleware/errorHandler.js';
import { CONSTANTS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

export class FileUploadService {
  static validateFileType(mimeType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-rar-compressed'
    ];
    return allowedTypes.includes(mimeType);
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  static isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  static isDocument(mimeType: string): boolean {
    return mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text') || mimeType.includes('excel');
  }
}
