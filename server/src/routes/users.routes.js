import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { deleteAccount, getProfile } from '../controllers/users.controller.js';

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
 * @route   DELETE /api/users/me
 * @desc    Delete current user account (cascades to all related data)
 * @access  Private
 */
router.delete('/me', deleteAccount);

export default router;

