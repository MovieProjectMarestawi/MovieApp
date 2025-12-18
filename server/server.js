import 'dotenv/config'; // Must be the first import to load env vars before other imports
import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/database.js';
import authRoutes from './src/routes/auth.routes.js';
import usersRoutes from './src/routes/users.routes.js';
// Movies & TMDb Integration (Muhammed's module)
import moviesRoutes from './src/routes/movies.routes.js';
// Reviews System (Jere Pähtila's module)
import reviewsRoutes from './src/routes/reviews.routes.js';
// Groups & Favorites (Jere Puirava's module)
import shareRoutes from './src/routes/share.routes.js';
import groupsRoutes from './src/routes/groups.routes.js';
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware.js';


const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware - Must be first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Also use cors package as backup
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Database connection
connectDB();

// Health check endpoint - keeps Supabase database active
app.get('/api/health', async (req, res) => {
  try {
    // Import pool to make a real database query
    const pool = (await import('./src/config/database.js')).default;
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Server is running',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
// Movies & TMDb Integration (Muhammed's module)
app.use('/api/movies', moviesRoutes);
// Reviews System (Jere Pähtila's module)
app.use('/api/reviews', reviewsRoutes);
// Groups & Favorites (Jere Puirava's module)
app.use('/api/favorites', shareRoutes); // /api/favorites/share/:userId
app.use('/api/groups', groupsRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT} (accessible via localhost:${PORT} and 127.0.0.1:${PORT})`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
