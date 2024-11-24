import express from 'express';
import { body } from 'express-validator';
import * as reviewController from '../controllers/review.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/products/:productId/reviews', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 3 })
], reviewController.createReview);

router.put('/reviews/:reviewId', [
  auth,
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 3 })
], reviewController.updateReview);

router.delete('/reviews/:reviewId', auth, reviewController.deleteReview);

export default router;