import { query } from '../config/database.js';
import { validateEmail, validateRequiredFields } from '../utils/validation.js';
import { validatePassword, hashPassword, comparePassword } from '../utils/password.js';

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

/**
 * Update user profile (email)
 * PUT /api/users/me
 * Requires authentication
 * Body: { email }
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { email } = req.body;

    // Validate email if provided
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.message,
        });
      }

      // Check if email is already taken by another user
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email is already in use by another account',
        });
      }
    }

    // Update user
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email.toLowerCase().trim());
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, created_at, updated_at`,
      updateValues
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * PUT /api/users/me/password
 * Requires authentication
 * Body: { currentPassword, newPassword }
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['currentPassword', 'newPassword']);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: requiredValidation.message,
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Get user's current password hash
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await comparePassword(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

