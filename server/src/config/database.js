import pkg from 'pg';

const { Pool } = pkg;

// PostgreSQL connection pool
// Supports both Supabase (connection string) and regular PostgreSQL
let pool;

if (process.env.DATABASE_URL) {
  // Supabase or other connection string format (used in production/Vercel)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else {
  // Regular PostgreSQL connection (for local development)
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'moviehub',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}


// Test database connection
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // In test environment, don't exit process
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    // In serverless (Vercel), throw error instead of exiting
    throw error;
  }
};

// Query helper function
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default pool;

