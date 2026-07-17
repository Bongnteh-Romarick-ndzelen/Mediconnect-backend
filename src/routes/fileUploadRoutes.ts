import express from 'express';
import { FileUploadController } from '../controllers/fileUploadController.js';
import { validate } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../services/fileUploadService.js';
import { uploadFileSchema } from '../schemas/validation.js';

const router = express.Router();

router.post('/', authenticate, upload.single('file'), validate(uploadFileSchema), FileUploadController.uploadFile);

export default router;
