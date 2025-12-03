import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth.routes.js';
import reviewsRoutes from '../routes/reviews.routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Test user data
const testUser = {
  email: 'review-test@example.com',
  password: 'Test1234',
};

let authToken;
let userId;
let movieId = 603; // The Matrix (TMDb ID)

describe('Reviews API Tests', () => {
  beforeAll(async () => {
    // Register a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    const { query } = await import('../config/database.js');
    // Clean up test data
    await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('GET /api/reviews - Browse Reviews', () => {
    it('should get all reviews successfully (public endpoint)', async () => {
      const res = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reviews');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
    });

    it('should get reviews with pagination', async () => {
      const res = await request(app)
        .get('/api/reviews?page=1&limit=10')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination).toHaveProperty('page', 1);
      expect(res.body.data.pagination).toHaveProperty('limit', 10);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('total_pages');
    });

    it('should get reviews for specific movie', async () => {
      const res = await request(app)
        .get(`/api/reviews?movie_id=${movieId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reviews');
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
      
      // All reviews should be for the specified movie
      res.body.data.reviews.forEach((review) => {
        expect(review.movie_id).toBe(movieId);
      });
    });

    it('should fail with invalid page number', async () => {
      const res = await request(app)
        .get('/api/reviews?page=0')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Page must be a positive number');
    });

    it('should fail with invalid limit', async () => {
      const res = await request(app)
        .get('/api/reviews?limit=200')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Limit must be between 1 and 100');
    });

    it('should fail with invalid movie_id', async () => {
      const res = await request(app)
        .get('/api/reviews?movie_id=invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie_id');
    });

    it('should return empty array when no reviews exist', async () => {
      // Use a movie ID that likely has no reviews
      const res = await request(app)
        .get('/api/reviews?movie_id=999999')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toEqual([]);
      expect(res.body.data.pagination.total).toBe(0);
    });
  });
});

