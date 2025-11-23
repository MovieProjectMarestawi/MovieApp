const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';



/**
 * Search movies
 * GET /api/movies/search
 * Query params: query, genre, year, page
 */
export const searchMovies = async (req, res, next) => {
  try {
    const { query, genre, year, page = 1 } = req.query;

    // At least one search criteria is required
    if (!query && !genre && !year) {
      return res.status(400).json({
        success: false,
        message: 'At least one search criteria is required (query, genre, or year)',
      });
    }

    let url;
    const params = new URLSearchParams();
    params.append('api_key', TMDB_API_KEY);
    params.append('page', page);

    if (query) {
      // Search by query
      url = `${TMDB_BASE_URL}/search/movie?${params.toString()}&query=${encodeURIComponent(query)}`;
    } else {
      // Discover movies by genre/year
      url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
      if (genre) params.append('with_genres', genre);
      if (year) params.append('year', year);
      url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.status_message || 'Failed to fetch movies from TMDb',
      });
    }

    // Transform poster and backdrop paths to full URLs
    const results = data.results.map(movie => ({
      ...movie,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
    }));

    res.json({
      success: true,
      data: {
        page: data.page,
        results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular movies
 * GET /api/movies/popular
 * Query params: page
 */
export const getPopularMovies = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;

    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page,
    });

    const url = `${TMDB_BASE_URL}/movie/popular?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.status_message || 'Failed to fetch popular movies',
      });
    }

    // Transform poster and backdrop paths
    const results = data.results.map(movie => ({
      ...movie,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
    }));

    res.json({
      success: true,
      data: {
        page: data.page,
        results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Discover movies (all movies with optional filters)
 * GET /api/movies/discover
 * Query params: page, genre, year, sort_by
 */
export const discoverMovies = async (req, res, next) => {
  try {
    const { page = 1, genre, year, sort_by = 'popularity.desc' } = req.query;

    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page,
      sort_by,
    });

    if (genre) {
      params.append('with_genres', genre);
    }

    if (year) {
      params.append('year', year);
    }

    const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.status_message || 'Failed to discover movies',
      });
    }

    // Transform poster and backdrop paths
    const results = data.results.map(movie => ({
      ...movie,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
    }));

    res.json({
      success: true,
      data: {
        page: data.page,
        results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get now playing movies
 * GET /api/movies/now-playing
 * Query params: region, page
 */
export const getNowPlaying = async (req, res, next) => {
  try {
    const { region = 'FI', page = 1 } = req.query;

    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      region,
      page,
    });

    const url = `${TMDB_BASE_URL}/movie/now_playing?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.status_message || 'Failed to fetch now playing movies',
      });
    }

    // Transform poster and backdrop paths
    const results = data.results.map(movie => ({
      ...movie,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
    }));

    res.json({
      success: true,
      data: {
        page: data.page,
        results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get movie details
 * GET /api/movies/:id
 */
export const getMovieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID',
      });
    }

    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
    });

    const url = `${TMDB_BASE_URL}/movie/${id}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.status_message || 'Movie not found',
      });
    }

    // Transform poster and backdrop paths
    const movie = {
      ...data,
      poster_path: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      backdrop_path: data.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
        : null,
    };

    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get movie genres
 * GET /api/movies/genres
 */
export const getGenres = async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
    });

    const url = `${TMDB_BASE_URL}/genre/movie/list?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.status_message || 'Failed to fetch genres',
      });
    }

    res.json({
      success: true,
      data: {
        genres: data.genres,
      },
    });
  } catch (error) {
    next(error);
  }
};

