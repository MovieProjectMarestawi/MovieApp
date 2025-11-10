import dotenv from 'dotenv';

describe('Environment Variables', () => {
  beforeAll(() => {
    dotenv.config();
  });

  test('should have all required environment variables', () => {
    expect(process.env.PORT).toBeDefined();
    expect(process.env.NODE_ENV).toBeDefined();
    expect(process.env.DB_HOST).toBeDefined();
    expect(process.env.DB_PORT).toBeDefined();
    expect(process.env.DB_NAME).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_PASS).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_EXPIRES_IN).toBeDefined();
    expect(process.env.TMDB_API_KEY).toBeDefined();
    expect(process.env.TMDB_BASE_URL).toBeDefined();
  });

  test('should have valid port number', () => {
    expect(Number(process.env.PORT)).not.toBeNaN();
    expect(Number(process.env.PORT)).toBeGreaterThan(0);
  });

  test('should have valid database port', () => {
    expect(Number(process.env.DB_PORT)).not.toBeNaN();
    expect(Number(process.env.DB_PORT)).toBeGreaterThan(0);
  });

  test('should have valid TMDB API configuration', () => {
    expect(process.env.TMDB_API_KEY.length).toBeGreaterThan(0);
    expect(process.env.TMDB_BASE_URL).toMatch(/^https:\/\/api\.themoviedb\.org\/3$/);
  });

  test('should have valid JWT configuration', () => {
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(0);
    expect(process.env.JWT_EXPIRES_IN).toMatch(/^[0-9]+[dhms]$/);  // days, hours, minutes, or seconds
  });
});