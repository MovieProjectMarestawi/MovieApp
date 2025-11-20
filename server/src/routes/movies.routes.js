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

// Hae elokuvia hakusanoilla / genrellä / vuodella
router.get('/search', searchMovies);

// Suosituimmat elokuvat
router.get('/popular', getPopularMovies);

// Discover — listaa elokuvia suodattimilla tai ilman
router.get('/discover', discoverMovies);

// Nyt teattereissa
router.get('/now-playing', getNowPlaying);

// Hae kaikki elokuvagenret
router.get('/genres', getGenres);

// Yksittäisen elokuvan tiedot
router.get('/:id', getMovieDetails);

// Elokuvan arvioinnit
router.get('/:id/reviews', getMovieReviews);

export default router;
