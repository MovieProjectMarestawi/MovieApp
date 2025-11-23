import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { query } from '../config/database.js';

/**
 * Optional authentication middleware
 * Adds req.user if token is valid, but doesn't fail if token is missing
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      req.user = null;
      return next();
    }

    // Verify user still exists in database
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      req.user = null;
      return next();
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // On any error, just continue without user
    req.user = null;
    next();
  }
};

