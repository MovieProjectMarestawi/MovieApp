import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviews.controller.js';

const router = express.Router();

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (public)
 * @access  Public
 */
router.get('/', getAllReviews);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticateToken, createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (own review only)
 */
router.put('/:id', authenticateToken, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (own review only)
 */
router.delete('/:id', authenticateToken, deleteReview);

export default router;

