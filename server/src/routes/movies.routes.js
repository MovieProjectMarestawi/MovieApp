import express from 'express';
import { search, nowPlaying, getDetails, genres } from '../controllers/movies.controller.js';
import { getMovieReviews } from '../controllers/reviews.controller.js';

const router = express.Router();

/**
 * @route   GET /api/movies/search
 * @desc    Search movies with multiple criteria (query, genre, year)
 * @access  Public
 * @query   { string } query - Movie title search query
 * @query   { number } genre - Genre ID
 * @query   { number } year - Release year
 * @query   { number } page - Page number (default: 1)
 */
router.get('/search', search);

/**
 * @route   GET /api/movies/now-playing
 * @desc    Get movies now playing in theaters (default: Finland)
 * @access  Public
 * @query   { string } region - Region code (default: FI)
 * @query   { number } page - Page number (default: 1)
 */
router.get('/now-playing', nowPlaying);

/**
 * @route   GET /api/movies/genres
 * @desc    Get list of movie genres
 * @access  Public
 */
router.get('/genres', genres);

/**
 * @route   GET /api/movies/:id/reviews
 * @desc    Get reviews for a specific movie (public)
 * @access  Public
 * @params  { id: number } - TMDb movie ID
 * Note: This route must be defined before /:id to avoid route conflicts
 */
router.get('/:id/reviews', getMovieReviews);

/**
 * @route   GET /api/movies/:id
 * @desc    Get movie details by ID
 * @access  Public
 * @params  { number } id - TMDb movie ID
 * Note: This route must be defined after /:id/reviews to avoid route conflicts
 */
router.get('/:id', getDetails);

export default router;

