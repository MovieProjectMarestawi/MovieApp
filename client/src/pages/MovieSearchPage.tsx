import { useState, useEffect } from 'react';
import { MovieCard } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { moviesAPI } from '../services/api';
import { toast } from 'sonner';
import { Movie } from '../types';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieWithRating extends Movie {
  calculatedRating?: number | null;
}

interface SearchFilters {
  query: string;
  genre: string;
  year: string;
  minRating: number;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
}

export function MovieSearchPage() {
  const [filteredMovies, setFilteredMovies] = useState<MovieWithRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    query: '',
    genre: 'all',
    year: 'all',
    minRating: 0
  });
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Load genres and initial movies on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load genres
        const genresData = await moviesAPI.getGenres();
        setGenres(genresData);

        // Load popular movies by default
        await loadMovies(1, false);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load movies');
      }
    };

    loadInitialData();
  }, []);

  const loadMovies = async (page: number, isSearch: boolean, filters?: SearchFilters) => {
    setLoading(true);
    const currentFilters = filters || activeFilters;
    try {
      let data;

      if (isSearch && (currentFilters.query || currentFilters.genre !== 'all' || currentFilters.year !== 'all')) {
        // Search mode
        let genreId: number | undefined;
        if (currentFilters.genre && currentFilters.genre !== 'all' && currentFilters.genre !== 'all-genres') {
          const genreObj = genres.find(g =>
            g.name.toLowerCase() === currentFilters.genre.replace('-', ' ').toLowerCase()
          );
          genreId = genreObj?.id;
        }

        const year = currentFilters.year && currentFilters.year !== 'all' && currentFilters.year !== 'all-years'
          ? parseInt(currentFilters.year)
          : undefined;

        if (currentFilters.query) {
          // Use search endpoint
          data = await moviesAPI.search(currentFilters.query || undefined, genreId, year, page);
        } else {
          // Use discover endpoint
          data = await moviesAPI.discover(page, genreId, year);
        }
      } else {
        // Discover mode - show all popular movies
        data = await moviesAPI.discover(page);
      }

      let movies = (data.results || []).map(convertTMDBToMovie);

      // Calculate ratings from user reviews for all movies
      const moviesWithRatings = await Promise.all(
        movies.map(async (movie: Movie) => {
          try {
            const reviewsData = await moviesAPI.getReviews(movie.id, 1, 1000);
            const reviews = reviewsData.reviews || [];
            let calculatedRating: number | null = null;

            if (reviews.length > 0) {
              const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
              calculatedRating = (sum / reviews.length) * 2; // Convert 1-5 scale to 1-10 scale
            }

            return {
              ...movie,
              calculatedRating,
            };
          } catch (error) {
            // Silently fail, use TMDB rating
            return {
              ...movie,
              calculatedRating: null,
            };
          }
        })
      );

      // Filter by rating (client-side) - use calculated rating if available
      let filtered = moviesWithRatings;
      if (currentFilters.minRating > 0) {
        filtered = moviesWithRatings.filter(movie => {
          const rating = movie.calculatedRating !== null && movie.calculatedRating !== undefined
            ? movie.calculatedRating
            : movie.rating;
          return rating >= currentFilters.minRating;
        });
      }

      setFilteredMovies(filtered);
      setTotalPages(data.total_pages || 1);
      setTotalResults(data.total_results || 0);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error loading movies:', error);
      toast.error(error.message || 'Failed to load movies');
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setActiveFilters(filters);
    setIsSearchMode(true);
    await loadMovies(1, true, filters);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadMovies(newPage, isSearchMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      query: '',
      genre: 'all',
      year: 'all',
      minRating: 0
    };
    setActiveFilters(clearedFilters);
    setIsSearchMode(false);
    loadMovies(1, false);
  };

  const hasActiveFilters =
    activeFilters.query ||
    (activeFilters.genre && activeFilters.genre !== 'all') ||
    (activeFilters.year && activeFilters.year !== 'all') ||
    activeFilters.minRating > 0;

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl mb-2">Discover Movies</h1>
          <p className="text-zinc-400">
            {isSearchMode && hasActiveFilters
              ? 'Search results from TMDb'
              : 'Browse thousands of amazing films from TMDb'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-zinc-400">
            {loading ? (
              'Loading...'
            ) : (
              <>
                {isSearchMode && hasActiveFilters ? (
                  <>
                    Found <span className="text-white font-semibold">{totalResults.toLocaleString()}</span> movies matching your criteria
                  </>
                ) : (
                  <>
                    Showing <span className="text-white font-semibold">{totalResults.toLocaleString()}</span> movies
                  </>
                )}
                {totalPages > 1 && (
                  <span className="text-zinc-500 ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </>
            )}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading...</div>
          </div>
        ) : filteredMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} calculatedRating={movie.calculatedRating} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={
                          currentPage === pageNum
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : hasActiveFilters ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-white text-2xl mb-2">No movies found</h3>
            <p className="text-zinc-400">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading movies...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to convert TMDb movie to our Movie type
function convertTMDBToMovie(tmdbMovie: TMDBMovie): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    posterUrl: tmdbMovie.poster_path || '',
    rating: tmdbMovie.vote_average,
    year: new Date(tmdbMovie.release_date).getFullYear() || 0,
    genre: tmdbMovie.genres?.map(g => g.name) || [],
    duration: tmdbMovie.runtime || 0,
    description: tmdbMovie.overview,
    director: '',
    cast: [],
    inCinemas: false,
    releaseDate: tmdbMovie.release_date,
  };
}
