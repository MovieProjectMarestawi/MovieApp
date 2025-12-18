import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from '../config/database.js';
import authRoutes from '../routes/auth.routes.js';
import usersRoutes from '../routes/users.routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';

dotenv.config();

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Test user data
const testUser = {
  email: 'delete-test@example.com',
  password: 'Test1234',
};

describe('Users API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Note: Database connection is handled by the app when routes are called
    // We don't need to connect here as it will be done automatically

    // Register a test user for delete tests
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.user.id;
  });

  afterAll(async () => {
    // Clean up any remaining test data
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('GET /api/users/me', () => {
    it('should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).toHaveProperty('created_at');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired token');
    });
  });

  describe('DELETE /api/users/me', () => {
    it('should delete user account successfully', async () => {
      // First, create a new user for deletion
      const newUser = {
        email: 'delete-me@example.com',
        password: 'Test1234',
      };

      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      const deleteToken = registerRes.body.data.token;

      // Delete the account
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Verify user is deleted
      const userCheck = await query(
        'SELECT id FROM users WHERE email = $1',
        [newUser.email]
      );
      expect(userCheck.rows.length).toBe(0);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .delete('/api/users/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or expired token');
    });
  });
});

