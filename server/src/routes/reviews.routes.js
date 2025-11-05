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
 * @route   POST /api/reviews
 * @desc    Create a new movie review (requires authentication)
 * @access  Private
 * @body    { movie_id: number, rating: number (1-5), text: string }
 */
router.post('/', authenticateToken, createReview);

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (public)
 * @access  Public
 * @query   { movie_id: number (optional), page: number (optional), limit: number (optional) }
 */
router.get('/', getAllReviews);

/**
 * @route   GET /api/movies/:id/reviews
 * @desc    Get reviews for a specific movie (public)
 * @access  Public
 * @params  { id: number } - TMDb movie ID
 */
// Note: This route is handled in movies.routes.js to keep movie-related routes together

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review (requires authentication, only own review)
 * @access  Private
 * @params  { id: number } - Review ID
 * @body    { rating: number (1-5, optional), text: string (optional) }
 */
router.put('/:id', authenticateToken, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review (requires authentication, only own review)
 * @access  Private
 * @params  { id: number } - Review ID
 */
router.delete('/:id', authenticateToken, deleteReview);

export default router;

