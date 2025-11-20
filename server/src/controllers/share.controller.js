import { query } from '../config/database.js';

/**
 * Get shareable favorites
 * GET /api/favorites/share/:userId
 * Public endpoint
 */
export const getShareableFavorites = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Get user info
    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [parseInt(userId)]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get favorites
    const favoritesResult = await query(
      'SELECT movie_id, created_at as added_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [parseInt(userId)]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
        },
        favorites: favoritesResult.rows,
        count: favoritesResult.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

