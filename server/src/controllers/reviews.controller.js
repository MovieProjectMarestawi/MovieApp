import { query } from '../config/database.js';
import { validateRequiredFields } from '../utils/validation.js';

/**
 * Create a new movie review
 * POST /api/reviews
 * Requires authentication
 * Body: { movie_id, rating, text }
 */
export const createReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { movie_id, rating, text } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['movie_id', 'rating', 'text']);
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

    // Validate rating (1-5)
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // Validate text (not empty)
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Review text cannot be empty',
      });
    }

    // Check if user already has a review for this movie
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND movie_id = $2',
      [userId, parseInt(movie_id)]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this movie. You can update your existing review.',
      });
    }

    // Create review
    const result = await query(
      `INSERT INTO reviews (user_id, movie_id, rating, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, movie_id, rating, text, created_at, updated_at`,
      [userId, parseInt(movie_id), ratingNum, text.trim()]
    );

    const review = result.rows[0];

    // Get user email for response
    const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userResult.rows[0].email;

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: {
          ...review,
          user_email: userEmail,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews (public)
 * GET /api/reviews
 * Query params: movie_id (optional), user_id (optional), page (optional), limit (optional)
 */
export const getAllReviews = async (req, res, next) => {
  try {
    const { movie_id, user_id, page = 1, limit = 20 } = req.query;

    // Validate page
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive number',
      });
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });
    }

    const offset = (pageNum - 1) * limitNum;

    let queryText;
    let queryParams;
    let countQuery;
    let countParams = [];

    // Build WHERE conditions based on filters
    const conditions = [];
    const filterParams = [];
    let paramIndex = 1;

    if (movie_id) {
      // Validate movie_id
      if (isNaN(movie_id) || parseInt(movie_id) < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid movie_id. Must be a positive number.',
        });
      }
      conditions.push(`r.movie_id = $${paramIndex++}`);
      filterParams.push(parseInt(movie_id));
    }

    if (user_id) {
      // Validate user_id
      if (isNaN(user_id) || parseInt(user_id) < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user_id. Must be a positive number.',
        });
      }
      conditions.push(`r.user_id = $${paramIndex++}`);
      filterParams.push(parseInt(user_id));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build main query
    queryText = `
      SELECT r.id, r.user_id, r.movie_id, r.rating, r.text, r.created_at, r.updated_at, u.email as user_email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    queryParams = [...filterParams, limitNum, offset];

    // Build count query
    countQuery = `SELECT COUNT(*) FROM reviews r ${whereClause}`;
    countParams = filterParams;

    const result = await query(queryText, queryParams);
    const reviews = result.rows;

    // Get total count
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a specific movie
 * GET /api/movies/:id/reviews
 * Public endpoint
 */
export const getMovieReviews = async (req, res, next) => {
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

    // Get reviews for this movie
    const result = await query(
      `SELECT r.id, r.user_id, r.movie_id, r.rating, r.text, r.created_at, r.updated_at, u.email as user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC`,
      [movieId]
    );

    const reviews = result.rows;

    res.json({
      success: true,
      data: {
        movie_id: movieId,
        reviews,
        count: reviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 * PUT /api/reviews/:id
 * Requires authentication (only own review)
 */
export const updateReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { rating, text } = req.body;

    // Validate review ID
    if (!id || isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    // Validate at least one field to update
    if (!rating && !text) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (rating or text) must be provided for update',
      });
    }

    // Check if review exists and belongs to user
    const reviewResult = await query(
      'SELECT id, user_id, movie_id FROM reviews WHERE id = $1',
      [parseInt(id)]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const review = reviewResult.rows[0];

    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Build update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number between 1 and 5',
        });
      }
      updates.push(`rating = $${paramIndex++}`);
      params.push(ratingNum);
    }

    if (text !== undefined) {
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Review text cannot be empty',
        });
      }
      updates.push(`text = $${paramIndex++}`);
      params.push(text.trim());
    }

    params.push(parseInt(id));

    // Update review
    const updateResult = await query(
      `UPDATE reviews 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING id, user_id, movie_id, rating, text, created_at, updated_at`,
      params
    );

    const updatedReview = updateResult.rows[0];

    // Get user email
    const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userResult.rows[0].email;

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: {
          ...updatedReview,
          user_email: userEmail,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/:id
 * Requires authentication (only own review)
 */
export const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate review ID
    if (!id || isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    // Check if review exists and belongs to user
    const reviewResult = await query(
      'SELECT id, user_id FROM reviews WHERE id = $1',
      [parseInt(id)]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const review = reviewResult.rows[0];

    if (review.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    // Delete review
    await query('DELETE FROM reviews WHERE id = $1', [parseInt(id)]);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

