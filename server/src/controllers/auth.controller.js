import { query } from '../config/database.js';
import { validateEmail, validateRequiredFields } from '../utils/validation.js';
import { validatePassword, hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email, password }
 */
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['email', 'password']);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: requiredValidation.message,
      });
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    // Validate password rules
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase().trim(), passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['email', 'password']);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: requiredValidation.message,
      });
    }

    // Find user by email
    const result = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * Note: Since we're using JWT (stateless), logout is handled client-side
 * by removing the token. This endpoint exists for consistency and future
 * token blacklisting if needed.
 */
export const logout = async (req, res) => {
  // JWT is stateless, so logout is handled client-side
  // In the future, we could implement token blacklisting here
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.',
  });
};

