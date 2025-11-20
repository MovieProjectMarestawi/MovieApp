import express from 'express';
import {
  searchMovies,
  getNowPlaying,
  getPopularMovies,
  discoverMovies,
  getMovieDetails,
  getGenres,
} from '../controllers/movies.controller.js';
import { getMovieReviews } from '../controllers/reviews.controller.js';

const router = express.Router();

/**
 * @route   GET /api/movies/search
 * @desc    Search movies by query, genre, or year
 * @access  Public
 */
router.get('/search', searchMovies);

/**
 * @route   GET /api/movies/popular
 * @desc    Get popular movies
 * @access  Public
 */
router.get('/popular', getPopularMovies);

/**
 * @route   GET /api/movies/discover
 * @desc    Discover movies (all movies with optional filters)
 * @access  Public
 */
router.get('/discover', discoverMovies);

/**
 * @route   GET /api/movies/now-playing
 * @desc    Get now playing movies
 * @access  Public
 */
router.get('/now-playing', getNowPlaying);

/**
 * @route   GET /api/movies/genres
 * @desc    Get movie genres
 * @access  Public
 */
router.get('/genres', getGenres);

/**
 * @route   GET /api/movies/:id
 * @desc    Get movie details
 * @access  Public
 */
router.get('/:id', getMovieDetails);

/**
 * @route   GET /api/movies/:id/reviews
 * @desc    Get reviews for a movie
 * @access  Public
 */
router.get('/:id/reviews', getMovieReviews);

export default router;
