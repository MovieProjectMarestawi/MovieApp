import {
  searchMovies,
  getNowPlaying,
  getMovieDetails,
  getGenres,
} from '../services/tmdb.service.js';


export const search = async (req, res, next) => {
  try {
    const { query, genre, year, page } = req.query;

    
    if (!query && !genre && !year) {
      return res.status(400).json({
        success: false,
        message: 'At least one search criteria is required (query, genre, or year)',
      });
    }

    
    if (genre && (isNaN(genre) || parseInt(genre) < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Genre must be a valid positive number (genre ID)',
      });
    }

    
    if (year && (isNaN(year) || parseInt(year) < 1900 || parseInt(year) > 2100)) {
      return res.status(400).json({
        success: false,
        message: 'Year must be a valid number between 1900 and 2100',
      });
    }

    
    const pageNum = page ? parseInt(page) : 1;
    if (pageNum < 1 || pageNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Page must be between 1 and 1000',
      });
    }

    
    const results = await searchMovies({
      query: query || undefined,
      genre: genre ? parseInt(genre) : undefined,
      year: year ? parseInt(year) : undefined,
      page: pageNum,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};


export const nowPlaying = async (req, res, next) => {
  try {
    const { region = 'FI', page } = req.query;

    
    if (region && region.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Region must be a 2-character ISO 3166-1 code (e.g., FI, US)',
      });
    }

   
    const pageNum = page ? parseInt(page) : 1;
    if (pageNum < 1 || pageNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Page must be between 1 and 1000',
      });
    }

    
    const results = await getNowPlaying({
      region: region.toUpperCase(),
      page: pageNum,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};


export const getDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    
    if (!id || isNaN(id) || parseInt(id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID. Must be a positive number.',
      });
    }

    const movieId = parseInt(id);

   
    const movie = await getMovieDetails(movieId);

    res.json({
      success: true,
      data: {
        movie,
      },
    });
  } catch (error) {
   
    if (error.message.includes('404') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }
    next(error);
  }
};


export const genres = async (req, res, next) => {
  try {
    const genres = await getGenres();

    res.json({
      success: true,
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};

