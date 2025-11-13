import { query } from '../config/database.js';
import { validateRequiredFields } from '../utils/validation.js';

/**
 * Add movie to favorites
 * POST /api/users/me/favorites
 * Requires authentication
 */
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { movie_id } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['movie_id']);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: requiredValidation.message,
      });
    }

    // Validate movie_id
    if (!movie_id || isNaN(movie_id) || parseInt(movie_id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie_id. Must be a positive number (TMDb movie ID).',
      });
    }

    // Check if already in favorites
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, parseInt(movie_id)]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Movie is already in your favorites',
      });
    }

    // Add to favorites
    const result = await query(
      `INSERT INTO favorites (user_id, movie_id)
       VALUES ($1, $2)
       RETURNING id, user_id, movie_id, created_at`,
      [userId, parseInt(movie_id)]
    );

    res.status(201).json({
      success: true,
      message: 'Movie added to favorites successfully',
      data: {
        favorite: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's favorites
 * GET /api/users/me/favorites
 * Requires authentication
 */
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      'SELECT id, user_id, movie_id, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: {
        favorites: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove movie from favorites
 * DELETE /api/users/me/favorites/:movieId
 * Requires authentication
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { movieId } = req.params;

    // Validate movie ID
    if (!movieId || isNaN(movieId) || parseInt(movieId) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    // Check if exists
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, parseInt(movieId)]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in favorites',
      });
    }

    // Remove from favorites
    await query('DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2', [
      userId,
      parseInt(movieId),
    ]);

    res.json({
      success: true,
      message: 'Movie removed from favorites successfully',
    });
  } catch (error) {
    next(error);
  }
};

