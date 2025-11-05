import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from '../config/database.js';
import authRoutes from '../routes/auth.routes.js';
import usersRoutes from '../routes/users.routes.js';
import shareRoutes from '../routes/share.routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';

dotenv.config();

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/favorites', shareRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Test user data
const testUser = {
  email: 'favorites-test@example.com',
  password: 'Test1234',
};

const testMovieId = 603; // The Matrix

describe('Favorites API Tests', () => {
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
    await query('DELETE FROM favorites WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('POST /api/users/me/favorites', () => {
    it('should add movie to favorites with valid data', async () => {
      const favoriteData = {
        movie_id: testMovieId,
      };

      const res = await request(app)
        .post('/api/users/me/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(favoriteData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.favorite).toHaveProperty('id');
      expect(res.body.data.favorite.movie_id).toBe(testMovieId);
      expect(res.body.data.favorite.user_id).toBe(userId);
      expect(res.body.data.favorite).toHaveProperty('created_at');
    });

    it('should fail without authentication', async () => {
      const favoriteData = {
        movie_id: testMovieId,
      };

      const res = await request(app)
        .post('/api/users/me/favorites')
        .send(favoriteData)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication');
    });

    it('should fail with missing movie_id', async () => {
      const res = await request(app)
        .post('/api/users/me/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie_id');
    });

    it('should fail with invalid movie_id', async () => {
      const favoriteData = {
        movie_id: 'invalid',
      };

      const res = await request(app)
        .post('/api/users/me/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(favoriteData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie_id');
    });

    it('should fail when trying to add duplicate favorite', async () => {
      const favoriteData = {
        movie_id: testMovieId,
      };

      const res = await request(app)
        .post('/api/users/me/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send(favoriteData)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already in your favorites');
    });
  });

  describe('GET /api/users/me/favorites', () => {
    it('should get user\'s favorite movies', async () => {
      const res = await request(app)
        .get('/api/users/me/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('favorites');
      expect(res.body.data.favorites).toBeInstanceOf(Array);
      expect(res.body.data).toHaveProperty('count');
      expect(res.body.data.count).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/users/me/favorites')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/me/favorites/:movieId', () => {
    it('should remove movie from favorites', async () => {
      const res = await request(app)
        .delete(`/api/users/me/favorites/${testMovieId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removed from favorites');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .delete(`/api/users/me/favorites/${testMovieId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent favorite', async () => {
      const res = await request(app)
        .delete('/api/users/me/favorites/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found in your favorites');
    });

    it('should fail with invalid movie_id', async () => {
      const res = await request(app)
        .delete('/api/users/me/favorites/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie_id');
    });
  });

  describe('GET /api/favorites/share/:userId', () => {
    let shareableUserId;

    beforeAll(async () => {
      // Add a favorite for shareable test
      await query(
        'INSERT INTO favorites (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, 550] // Fight Club
      );
      shareableUserId = userId;
    });

    it('should get shareable favorites list (public)', async () => {
      const res = await request(app)
        .get(`/api/favorites/share/${shareableUserId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id', shareableUserId);
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('favorites');
      expect(res.body.data.favorites).toBeInstanceOf(Array);
      expect(res.body.data).toHaveProperty('count');
    });

    it('should fail with invalid user ID', async () => {
      const res = await request(app)
        .get('/api/favorites/share/invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid user ID');
    });

    it('should fail with non-existent user ID', async () => {
      const res = await request(app)
        .get('/api/favorites/share/99999')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User not found');
    });

    it('should return empty favorites list if user has no favorites', async () => {
      // Create a user with no favorites
      const emptyUser = {
        email: 'empty-favorites@example.com',
        password: 'Test1234',
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(emptyUser);

      const emptyUserId = registerRes.body.data.user.id;

      const res = await request(app)
        .get(`/api/favorites/share/${emptyUserId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.favorites).toEqual([]);
      expect(res.body.data.count).toBe(0);

      // Clean up
      await query('DELETE FROM users WHERE id = $1', [emptyUserId]);
    });
  });
});

