import express from 'express';
import { getShareableFavorites } from '../controllers/favorites.controller.js';

const router = express.Router();

/**
 * @route   GET /api/favorites/share/:userId
 * @desc    Get shareable favorites list (public)
 * @access  Public
 * @params  { userId: number } - User ID
 */
router.get('/share/:userId', getShareableFavorites);

export default router;

