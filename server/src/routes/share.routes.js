import express from 'express';
import { getShareableFavorites } from '../controllers/share.controller.js';

const router = express.Router();

/**
 * @route   GET /api/favorites/share/:userId
 * @desc    Get shareable favorites for a user
 * @access  Public
 */
router.get('/share/:userId', getShareableFavorites);

export default router;

