import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
