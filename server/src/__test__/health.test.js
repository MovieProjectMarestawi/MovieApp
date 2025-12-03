import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Create minimal test app for health check
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint (no database required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

describe('Health Check Tests', () => {
  it('should return health check status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.status).toBe('OK');
    expect(res.body.message).toBe('Server is running');
  });
});

