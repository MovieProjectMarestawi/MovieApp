import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moviesRoutes from '../routes/movies.routes.js';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware.js';

dotenv.config();

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/movies', moviesRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

describe('Movies API Tests', () => {
  // Skip tests if TMDb API key is not configured
  const hasApiKey = !!process.env.TMDB_API_KEY;

  describe('GET /api/movies/search', () => {
    it('should search movies by query', async () => {
      if (!hasApiKey) {
        console.log('⚠️  Skipping test: TMDb API key not configured');
        return;
      }

      const res = await request(app)
        .get('/api/movies/search')
        .query({ query: 'inception' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('results');
      expect(res.body.data.results).toBeInstanceOf(Array);
      expect(res.body.data.results.length).toBeGreaterThan(0);
      expect(res.body.data.results[0]).toHaveProperty('id');
      expect(res.body.data.results[0]).toHaveProperty('title');
    });

    it('should search movies by year', async () => {
      if (!hasApiKey) {
        console.log('⚠️  Skipping test: TMDb API key not configured');
        return;
      }

      const res = await request(app)
        .get('/api/movies/search')
        .query({ year: 2020 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('results');
      expect(res.body.data.results).toBeInstanceOf(Array);
    });

    it('should fail without any search criteria', async () => {
      const res = await request(app)
        .get('/api/movies/search')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('At least one search criteria');
    });

    it('should fail with invalid genre', async () => {
      const res = await request(app)
        .get('/api/movies/search')
        .query({ genre: 'invalid' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Genre must be a valid');
    });

    it('should fail with invalid year', async () => {
      const res = await request(app)
        .get('/api/movies/search')
        .query({ year: 1800 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Year must be');
    });

    it('should fail with invalid page', async () => {
      const res = await request(app)
        .get('/api/movies/search')
        .query({ query: 'test', page: 0 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Page must be');
    });
  });

  describe('GET /api/movies/now-playing', () => {
    it('should get now playing movies in Finland', async () => {
      if (!hasApiKey) {
        console.log('⚠️  Skipping test: TMDb API key not configured');
        return;
      }

      const res = await request(app)
        .get('/api/movies/now-playing')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('results');
      expect(res.body.data.results).toBeInstanceOf(Array);
      expect(res.body.data.results.length).toBeGreaterThan(0);
    });

    it('should get now playing movies with custom region', async () => {
      if (!hasApiKey) {
        console.log('⚠️  Skipping test: TMDb API key not configured');
        return;
      }

      const res = await request(app)
        .get('/api/movies/now-playing')
        .query({ region: 'US' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('results');
    });

    it('should fail with invalid region code', async () => {
      const res = await request(app)
        .get('/api/movies/now-playing')
        .query({ region: 'USA' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Region must be a 2-character');
    });

    it('should fail with invalid page', async () => {
      const res = await request(app)
        .get('/api/movies/now-playing')
        .query({ page: 2000 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Page must be');
    });
  });

  describe('GET /api/movies/genres', () => {
    it('should get movie genres list', async () => {
      if (!hasApiKey) {
        console.log('⚠️  Skipping test: TMDb API key not configured');
        return;
      }

      const res = await request(app)
        .get('/api/movies/genres')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('genres');
      expect(res.body.data.genres).toBeInstanceOf(Array);
      expect(res.body.data.genres.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/movies/:id', () => {
    it('should get movie details by ID', async () => {
      if (!hasApiKey) {
        console.log('⚠️  Skipping test: TMDb API key not configured');
        return;
      }

      // Use a well-known movie ID (The Matrix - 603)
      const res = await request(app)
        .get('/api/movies/603')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('movie');
      expect(res.body.data.movie).toHaveProperty('id');
      expect(res.body.data.movie).toHaveProperty('title');
    });

    it('should fail with invalid movie ID', async () => {
      const res = await request(app)
        .get('/api/movies/invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie ID');
    });

    it('should fail with negative movie ID', async () => {
      const res = await request(app)
        .get('/api/movies/-1')
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid movie ID');
    });
  });
});

