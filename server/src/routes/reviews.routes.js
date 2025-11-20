import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviews.controller.js';

const router = express.Router();

// Hae kaikki arvostelut julkinen
router.get('/', getAllReviews);

// Luo uusi arvostelu vaatii kirjautumisen
router.post('/', authenticateToken, createReview);

// Päivitä oma arvostelu
router.put('/:id', authenticateToken, updateReview);

// Poista oma arvostelu
router.delete('/:id', authenticateToken, deleteReview);

export default router;
