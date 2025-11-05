import { query } from '../config/database.js';

/**
 * Delete current user account
 * DELETE /api/users/me
 * Requires authentication
 * Cascades to delete user's reviews, favorites, groups, etc.
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Verify user exists
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user (CASCADE will handle related data)
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'Account deleted successfully. All associated data has been removed.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/users/me
 * Requires authentication
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      'SELECT id, email, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

