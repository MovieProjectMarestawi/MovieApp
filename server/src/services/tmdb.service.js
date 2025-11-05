/**
 * TMDb API Service
 * Secure proxy for TMDb API requests
 * Protects API key from being exposed to frontend
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Make request to TMDb API
 * @param {string} endpoint - API endpoint (e.g., '/search/movie')
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - API response data
 */
const fetchFromTMDB = async (endpoint, params = {}) => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDb API key is not configured. Please set TMDB_API_KEY in .env file.');
  }

  // Build query string
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.status_message || `TMDb API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes('TMDb API')) {
      throw error;
    }
    throw new Error(`Failed to fetch from TMDb API: ${error.message}`);
  }
};

/**
 * Get full image URL
 * @param {string} path - Image path from TMDb
 * @param {string} size - Image size (e.g., 'w500', 'original')
 * @returns {string} - Full image URL
 */
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

/**
 * Search movies with multiple criteria
 * @param {object} options - Search options
 * @param {string} options.query - Search query (movie title)
 * @param {number} options.genre - Genre ID
 * @param {number} options.year - Release year
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<object>} - Search results
 */
export const searchMovies = async ({ query, genre, year, page = 1 }) => {
  const params = {
    page: page.toString(),
    language: 'en-US',
    include_adult: 'false',
  };

  // Add query if provided
  if (query && query.trim()) {
    params.query = query.trim();
  }

  // Add year if provided
  if (year) {
    params.year = year.toString();
  }

  // Add genre if provided (requires discover endpoint)
  if (genre) {
    // If genre is provided, use discover endpoint instead of search
    return await discoverMovies({ genre, year, page });
  }

  // Use search endpoint
  const data = await fetchFromTMDB('/search/movie', params);

  // Enhance results with image URLs
  return {
    ...data,
    results: data.results.map((movie) => ({
      ...movie,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path),
    })),
  };
};

/**
 * Discover movies by criteria (for genre filtering)
 * @param {object} options - Discover options
 * @param {number} options.genre - Genre ID
 * @param {number} options.year - Release year
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<object>} - Discover results
 */
const discoverMovies = async ({ genre, year, page = 1 }) => {
  const params = {
    page: page.toString(),
    language: 'en-US',
    include_adult: 'false',
    sort_by: 'popularity.desc',
  };

  // Add genre if provided
  if (genre) {
    params.with_genres = genre.toString();
  }

  // Add year if provided
  if (year) {
    params.primary_release_year = year.toString();
  }

  const data = await fetchFromTMDB('/discover/movie', params);

  // Enhance results with image URLs
  return {
    ...data,
    results: data.results.map((movie) => ({
      ...movie,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path),
    })),
  };
};

/**
 * Get movies now playing in theaters
 * @param {object} options - Options
 * @param {string} options.region - Region code (default: 'FI' for Finland)
 * @param {number} options.page - Page number (default: 1)
 * @returns {Promise<object>} - Now playing movies
 */
export const getNowPlaying = async ({ region = 'FI', page = 1 } = {}) => {
  const params = {
    page: page.toString(),
    language: 'en-US',
    region: region,
  };

  const data = await fetchFromTMDB('/movie/now_playing', params);

  // Enhance results with image URLs
  return {
    ...data,
    results: data.results.map((movie) => ({
      ...movie,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path),
    })),
  };
};

/**
 * Get movie details by ID
 * @param {number} movieId - TMDb movie ID
 * @returns {Promise<object>} - Movie details
 */
export const getMovieDetails = async (movieId) => {
  const params = {
    language: 'en-US',
    append_to_response: 'videos,credits',
  };

  const data = await fetchFromTMDB(`/movie/${movieId}`, params);

  // Enhance with image URLs
  return {
    ...data,
    poster_path: getImageUrl(data.poster_path),
    backdrop_path: getImageUrl(data.backdrop_path),
    belongs_to_collection: data.belongs_to_collection
      ? {
          ...data.belongs_to_collection,
          poster_path: getImageUrl(data.belongs_to_collection.poster_path),
          backdrop_path: getImageUrl(data.belongs_to_collection.backdrop_path),
        }
      : null,
  };
};

/**
 * Get movie genres list
 * @returns {Promise<object>} - Genres list
 */
export const getGenres = async () => {
  const data = await fetchFromTMDB('/genre/movie/list', {
    language: 'en-US',
  });

  return data;
};

