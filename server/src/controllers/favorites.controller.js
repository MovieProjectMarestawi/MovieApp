import { query } from '../config/database.js';

/**
 * Add movie to favorites
 * POST /api/users/me/favorites
 * Requires authentication
 * Body: { movie_id }
 */
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { movie_id } = req.body;

    // Validate movie_id
    if (!movie_id || isNaN(movie_id) || parseInt(movie_id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie_id. Must be a positive number (TMDb movie ID).',
      });
    }

    const movieId = parseInt(movie_id);

    // Check if movie is already in favorites
    const existingFavorite = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Movie is already in your favorites list',
      });
    }

    // Add to favorites
    const result = await query(
      `INSERT INTO favorites (user_id, movie_id)
       VALUES ($1, $2)
       RETURNING id, user_id, movie_id, created_at`,
      [userId, movieId]
    );

    const favorite = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Movie added to favorites successfully',
      data: {
        favorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's favorite movies
 * GET /api/users/me/favorites
 * Requires authentication
 */
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT id, user_id, movie_id, created_at
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const favorites = result.rows;

    res.json({
      success: true,
      data: {
        favorites,
        count: favorites.length,
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

    // Validate movie_id
    if (!movieId || isNaN(movieId) || parseInt(movieId) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie_id. Must be a positive number.',
      });
    }

    // Check if favorite exists
    const favoriteResult = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, parseInt(movieId)]
    );

    if (favoriteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in your favorites list',
      });
    }

    // Remove from favorites
    await query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, parseInt(movieId)]
    );

    res.json({
      success: true,
      message: 'Movie removed from favorites successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get shareable favorites list (public)
 * GET /api/favorites/share/:userId
 * Public endpoint - returns public-safe view of user's favorites
 */
export const getShareableFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || isNaN(userId) || parseInt(userId) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [parseInt(userId)]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Get user's favorites (public view - only movie IDs)
    const favoritesResult = await query(
      `SELECT movie_id, created_at
       FROM favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [parseInt(userId)]
    );

    const favorites = favoritesResult.rows;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        favorites: favorites.map((f) => ({
          movie_id: f.movie_id,
          added_at: f.created_at,
        })),
        count: favorites.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

