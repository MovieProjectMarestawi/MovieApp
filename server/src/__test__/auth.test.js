import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
  email: 'test@example.com',
  password: 'Test1234',
};

const invalidUser = {
  email: 'invalid-email',
  password: 'weak',
};

describe('Auth API Tests', () => {
  beforeAll(async () => {
    // Note: Database connection is handled by the app when routes are called
    // We don't need to connect here as it will be done automatically
  });

  afterAll(async () => {
    // Clean up test data
    const { query } = await import('../config/database.js');
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: invalidUser.email,
          password: testUser.password,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('email');
    });

    it('should fail with weak password (less than 8 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'weak',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('8 characters');
    });

    it('should fail with password without uppercase', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test3@example.com',
          password: 'test1234',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('uppercase');
    });

    it('should fail with password without number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test4@example.com',
          password: 'TestPassword',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('number');
    });

    it('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: testUser.password,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail when user already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should fail with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logout successful');
    });
  });
});

