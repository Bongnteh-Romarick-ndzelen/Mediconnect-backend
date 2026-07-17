import express from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { validate } from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createReviewSchema,
  updateReviewSchema,
  respondToReviewSchema,
  getReviewSchema,
  listReviewsSchema
} from '../schemas/validation.js';

const router = express.Router();

// Create review (patient only)
router.post('/', authenticate, authorize('PATIENT'), validate(createReviewSchema), ReviewController.createReview);

// Get single review
router.get('/:id', authenticate, validate(getReviewSchema), ReviewController.getReview);

// List reviews
router.get('/', authenticate, validate(listReviewsSchema), ReviewController.listReviews);

// Update review (patient only)
router.put('/:id', authenticate, authorize('PATIENT'), validate(updateReviewSchema), ReviewController.updateReview);

// Provider responds to review (provider only)
router.post('/:id/respond', authenticate, authorize('PROVIDER'), validate(respondToReviewSchema), ReviewController.respondToReview);

// Delete review (patient or admin)
router.delete('/:id', authenticate, ReviewController.deleteReview);

export default router;
