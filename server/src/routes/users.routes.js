import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { deleteAccount, getProfile, updateProfile, changePassword } from '../controllers/users.controller.js';
// Groups & Favorites (Jere Puirava's module)
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favorites.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', getProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile (email)
 * @access  Private
 */
router.put('/me', updateProfile);

/**
 * @route   PUT /api/users/me/password
 * @desc    Change current user password
 * @access  Private
 */
router.put('/me/password', changePassword);

/**
 * @route   DELETE /api/users/me
 * @desc    Delete current user account (cascades to all related data)
 * @access  Private
 */
router.delete('/me', deleteAccount);

/**
 * @route   POST /api/users/me/favorites
 * @desc    Add movie to favorites (requires authentication)
 * @access  Private
 * @body    { movie_id: number }
 */
router.post('/me/favorites', addFavorite);

/**
 * @route   GET /api/users/me/favorites
 * @desc    Get user's favorite movies (requires authentication)
 * @access  Private
 */
router.get('/me/favorites', getFavorites);

/**
 * @route   DELETE /api/users/me/favorites/:movieId
 * @desc    Remove movie from favorites (requires authentication)
 * @access  Private
 * @params  { movieId: number } - TMDb movie ID
 */
router.delete('/me/favorites/:movieId', removeFavorite);

export default router;

