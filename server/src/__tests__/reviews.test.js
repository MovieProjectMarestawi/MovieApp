import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from '../config/database.js';
import authRoutes from '../routes/auth.routes.js';
import usersRoutes from '../routes/users.routes.js';
import reviewsRoutes from '../routes/reviews.routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';

dotenv.config();

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Test user data
const testUser = {
  email: 'review-test@example.com',
  password: 'Test1234',
};

const testMovieId = 603; // The Matrix

describe('Reviews API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Register a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('POST /api/reviews', () => {
    it('should create a new review with valid data', async () => {
      const reviewData = {
        movie_id: testMovieId,
        rating: 5,
        text: 'Amazing movie! Best sci-fi film ever.',
      };

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.review).toHaveProperty('id');
      expect(res.body.data.review.movie_id).toBe(testMovieId);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.review.text).toBe('Amazing movie! Best sci-fi film ever.');
      expect(res.body.data.review).toHaveProperty('user_email');
      expect(res.body.data.review).toHaveProperty('created_at');
    });

    it('should fail without authentication', async () => {
      const reviewData = {
        movie_id: testMovieId,
        rating: 5,
        text: 'Test review',
      };

      const res = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication');
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ movie_id: testMovieId })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail with invalid rating', async () => {
      const reviewData = {
        movie_id: testMovieId,
        rating: 6,
        text: 'Test review',
      };

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Rating must be');
    });

    it('should fail with invalid movie_id', async () => {
      const reviewData = {
        movie_id: 'invalid',
        rating: 5,
        text: 'Test review',
      };

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie_id');
    });

    it('should fail with empty text', async () => {
      const reviewData = {
        movie_id: testMovieId,
        rating: 5,
        text: '',
      };

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/empty|required|Missing/);
    });

    it('should fail when trying to create duplicate review', async () => {
      const reviewData = {
        movie_id: testMovieId,
        rating: 4,
        text: 'Another review for the same movie',
      };

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already reviewed');
    });
  });

  describe('GET /api/reviews', () => {
    it('should get all reviews (public)', async () => {
      const res = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reviews');
      expect(res.body.data.reviews).toBeInstanceOf(Array);
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should get reviews filtered by movie_id', async () => {
      const res = await request(app)
        .get(`/api/reviews?movie_id=${testMovieId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toBeInstanceOf(Array);
      // All reviews should be for the specified movie
      res.body.data.reviews.forEach((review) => {
        expect(review.movie_id).toBe(testMovieId);
      });
    });

    it('should get reviews with pagination', async () => {
      const res = await request(app)
        .get('/api/reviews?page=1&limit=10')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination).toHaveProperty('page', 1);
      expect(res.body.data.pagination).toHaveProperty('limit', 10);
    });

    it('should fail with invalid page', async () => {
      const res = await request(app)
        .get('/api/reviews?page=0')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Page must be');
    });

    it('should fail with invalid limit', async () => {
      const res = await request(app)
        .get('/api/reviews?limit=200')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Limit must be');
    });

    it('should include user_email in review data', async () => {
      const res = await request(app)
        .get(`/api/reviews?movie_id=${testMovieId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data.reviews.length > 0) {
        expect(res.body.data.reviews[0]).toHaveProperty('user_email');
      }
    });
  });

  describe('PUT /api/reviews/:id', () => {
    let reviewId;
    const updateMovieId = 550; // Fight Club

    beforeAll(async () => {
      // Clean up any existing review for this movie
      await query('DELETE FROM reviews WHERE user_id = $1 AND movie_id = $2', [userId, updateMovieId]);
      
      // Create a review to update
      const reviewData = {
        movie_id: updateMovieId,
        rating: 4,
        text: 'Original review text',
      };

      const createRes = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);

      if (createRes.status === 201 && createRes.body.data?.review?.id) {
        reviewId = createRes.body.data.review.id;
      } else {
        // If creation failed, try to get existing review
        const existingRes = await request(app)
          .get(`/api/reviews?movie_id=${updateMovieId}`)
          .expect(200);
        
        if (existingRes.body.data?.reviews?.length > 0) {
          const userReview = existingRes.body.data.reviews.find(r => r.user_id === userId);
          if (userReview) {
            reviewId = userReview.id;
          }
        }
      }
      
      if (!reviewId) {
        throw new Error(`Failed to get review ID for update test. Status: ${createRes.status}, Body: ${JSON.stringify(createRes.body)}`);
      }
    });

    afterAll(async () => {
      // Clean up review used for update tests
      if (reviewId) {
        await query('DELETE FROM reviews WHERE id = $1', [reviewId]);
      }
    });

    it('should update review with valid data', async () => {
      const updateData = {
        rating: 5,
        text: 'Updated review text',
      };

      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.review.text).toBe('Updated review text');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .send({ rating: 5 })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail when updating someone else\'s review', async () => {
      // Clean up any existing user first
      const anotherUserEmail = `another-user-${Date.now()}@example.com`;
      await query('DELETE FROM users WHERE email = $1', [anotherUserEmail]);
      
      // Create another user
      const anotherUser = {
        email: anotherUserEmail,
        password: 'Test1234',
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(anotherUser);

      // Handle both success and conflict cases
      let anotherToken;
      if (registerRes.status === 201 && registerRes.body.data?.token) {
        anotherToken = registerRes.body.data.token;
      } else if (registerRes.status === 409) {
        // User already exists, login instead
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send(anotherUser)
          .expect(200);
        anotherToken = loginRes.body.data.token;
      } else {
        throw new Error(`Failed to register/login another user. Status: ${registerRes.status}, Body: ${JSON.stringify(registerRes.body)}`);
      }

      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ rating: 1 })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('own reviews');

      // Clean up
      await query('DELETE FROM users WHERE email = $1', [anotherUserEmail]);
    });

    it('should fail with invalid review ID', async () => {
      const res = await request(app)
        .put('/api/reviews/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    let reviewId;
    const deleteMovieId = 13; // Forrest Gump

    beforeAll(async () => {
      // Clean up any existing review for this movie
      await query('DELETE FROM reviews WHERE user_id = $1 AND movie_id = $2', [userId, deleteMovieId]);
      
      // Create a review to delete
      const reviewData = {
        movie_id: deleteMovieId,
        rating: 5,
        text: 'Review to be deleted',
      };

      const createRes = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);

      if (createRes.status === 201 && createRes.body.data?.review?.id) {
        reviewId = createRes.body.data.review.id;
      } else {
        // If creation failed, try to get existing review
        const existingRes = await request(app)
          .get(`/api/reviews?movie_id=${deleteMovieId}`)
          .expect(200);
        
        if (existingRes.body.data?.reviews?.length > 0) {
          const userReview = existingRes.body.data.reviews.find(r => r.user_id === userId);
          if (userReview) {
            reviewId = userReview.id;
          }
        }
      }
      
      if (!reviewId) {
        throw new Error(`Failed to get review ID for delete test. Status: ${createRes.status}, Body: ${JSON.stringify(createRes.body)}`);
      }
    });

    it('should delete review with valid ID', async () => {
      const res = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');
      
      // Mark as deleted so afterAll doesn't try to delete again
      reviewId = null;
    });

    it('should fail without authentication', async () => {
      // Create a new review for this test since previous one was deleted
      const reviewData = {
        movie_id: deleteMovieId,
        rating: 5,
        text: 'Review for auth test',
      };

      const createRes = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData);

      const testReviewId = createRes.body.data?.review?.id;
      
      if (!testReviewId) {
        throw new Error(`Failed to create review for auth test. Status: ${createRes.status}`);
      }

      const res = await request(app)
        .delete(`/api/reviews/${testReviewId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
      
      // Clean up
      await query('DELETE FROM reviews WHERE id = $1', [testReviewId]);
    });

    it('should fail with non-existent review ID', async () => {
      const res = await request(app)
        .delete('/api/reviews/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });
});

