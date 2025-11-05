import {
  searchMovies,
  getNowPlaying,
  getMovieDetails,
  getGenres,
} from '../services/tmdb.service.js';

/**
 * Search movies with multiple criteria
 * GET /api/movies/search
 * Query params: query, genre, year, page
 */
export const search = async (req, res, next) => {
  try {
    const { query, genre, year, page } = req.query;

    // Validate that at least one search criteria is provided
    if (!query && !genre && !year) {
      return res.status(400).json({
        success: false,
        message: 'At least one search criteria is required (query, genre, or year)',
      });
    }

    // Validate genre if provided
    if (genre && (isNaN(genre) || parseInt(genre) < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Genre must be a valid positive number (genre ID)',
      });
    }

    // Validate year if provided
    if (year && (isNaN(year) || parseInt(year) < 1900 || parseInt(year) > 2100)) {
      return res.status(400).json({
        success: false,
        message: 'Year must be a valid number between 1900 and 2100',
      });
    }

    // Validate page if provided
    const pageNum = page ? parseInt(page) : 1;
    if (pageNum < 1 || pageNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Page must be between 1 and 1000',
      });
    }

    // Search movies
    const results = await searchMovies({
      query: query || undefined,
      genre: genre ? parseInt(genre) : undefined,
      year: year ? parseInt(year) : undefined,
      page: pageNum,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get movies now playing in theaters
 * GET /api/movies/now-playing
 * Query params: region (default: FI), page
 */
export const nowPlaying = async (req, res, next) => {
  try {
    const { region = 'FI', page } = req.query;

    // Validate region code (2 characters)
    if (region && region.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Region must be a 2-character ISO 3166-1 code (e.g., FI, US)',
      });
    }

    // Validate page if provided
    const pageNum = page ? parseInt(page) : 1;
    if (pageNum < 1 || pageNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Page must be between 1 and 1000',
      });
    }

    // Get now playing movies
    const results = await getNowPlaying({
      region: region.toUpperCase(),
      page: pageNum,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get movie details by ID
 * GET /api/movies/:id
 */
export const getDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate movie ID
    if (!id || isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID. Must be a positive number.',
      });
    }

    const movieId = parseInt(id);

    // Get movie details
    const movie = await getMovieDetails(movieId);

    res.json({
      success: true,
      data: {
        movie,
      },
    });
  } catch (error) {
    // Handle TMDb API errors (e.g., movie not found)
    if (error.message.includes('404') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }
    next(error);
  }
};

/**
 * Get movie genres list
 * GET /api/movies/genres
 */
export const genres = async (req, res, next) => {
  try {
    const genres = await getGenres();

    res.json({
      success: true,
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};

