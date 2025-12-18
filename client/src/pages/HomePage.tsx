import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, TrendingUp, Clock, Star } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { moviesAPI, favoritesAPI } from '../services/api';
import { toast } from 'sonner';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';

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

interface MovieWithRating extends Movie {
  calculatedRating?: number | null;
}

export function HomePage() {
  const { isLoggedIn } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState<TMDBMovie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [trendingMovies, setTrendingMovies] = useState<MovieWithRating[]>([]);
  const [nowInCinemas, setNowInCinemas] = useState<MovieWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) {
        setFavoriteIds([]);
        return;
      }
      try {
        const favorites = await favoritesAPI.getAll();
        const ids = favorites.map((f: any) => f.movie_id);
        setFavoriteIds(ids);
      } catch (error) {
        // Silently fail
        setFavoriteIds([]);
      }
    };
    fetchFavorites();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get now playing movies for featured and now in cinemas
        const nowPlayingData = await moviesAPI.getNowPlaying('FI', 1);
        const movies = nowPlayingData.results || [];
        
        if (movies.length > 0) {
          // Use first 5 movies for hero rotation
          setFeaturedMovies(movies.slice(0, 5));
        }
        
        // Get trending movies (using popular movies)
        const popularData = await moviesAPI.getPopular(1);
        const trendingMoviesList = (popularData.results || []).slice(0, 6);
        
        // Calculate ratings from user reviews for trending movies
        const trendingMoviesWithRatings = await Promise.all(
          trendingMoviesList.map(async (movie: TMDBMovie) => {
            try {
              const reviewsData = await moviesAPI.getReviews(movie.id, 1, 1000);
              const reviews = reviewsData.reviews || [];
              let calculatedRating: number | null = null;
              
              if (reviews.length > 0) {
                const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
                calculatedRating = (sum / reviews.length) * 2; // Convert 1-5 scale to 1-10 scale
              }
              
              return {
                ...convertTMDBToMovie(movie),
                calculatedRating,
              };
            } catch (error) {
              // Silently fail, use TMDB rating
              return {
                ...convertTMDBToMovie(movie),
                calculatedRating: null,
              };
            }
          })
        );
        
        setTrendingMovies(trendingMoviesWithRatings);
        
        // Calculate ratings for now in cinemas movies
        if (movies.length > 0) {
          const nowInCinemasWithRatings = await Promise.all(
            movies.slice(0, 4).map(async (movie: TMDBMovie) => {
              try {
                const reviewsData = await moviesAPI.getReviews(movie.id, 1, 1000);
                const reviews = reviewsData.reviews || [];
                let calculatedRating: number | null = null;
                
                if (reviews.length > 0) {
                  const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
                  calculatedRating = (sum / reviews.length) * 2; // Convert 1-5 scale to 1-10 scale
                }
                
                return {
                  ...convertTMDBToMovie(movie),
                  calculatedRating,
                };
              } catch (error) {
                // Silently fail, use TMDB rating
                return {
                  ...convertTMDBToMovie(movie),
                  calculatedRating: null,
                };
              }
            })
          );
          
          setNowInCinemas(nowInCinemasWithRatings);
        }
        
      } catch (error: any) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate featured movies every 6 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMovieIndex((prev) => (prev + 1) % featuredMovies.length);
        setIsTransitioning(false);
      }, 300); // Faster transition
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (featuredMovies.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">No movies available</div>
      </div>
    );
  }

  const featuredMovie = featuredMovies[currentMovieIndex];

  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
  };

  const getGenres = (movie: TMDBMovie) => {
    return movie.genres?.map(g => g.name) || [];
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={featuredMovie.backdrop_path || featuredMovie.poster_path || ''}
            alt={featuredMovie.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Movie Indicators */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentMovieIndex(index);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentMovieIndex
                    ? 'w-8 bg-red-600'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to movie ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className={`max-w-2xl transition-opacity duration-500 ease-in-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <span className="text-red-600 uppercase tracking-wide">Featured</span>
            </div>
            
            <h1 className="text-white text-4xl md:text-6xl mb-4">
              {featuredMovie.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6 text-zinc-300">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span>{featuredMovie.vote_average.toFixed(1)}</span>
              </div>
              <span>{getYear(featuredMovie.release_date)}</span>
              {featuredMovie.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{featuredMovie.runtime} min</span>
                </div>
              )}
            </div>

            <p className="text-zinc-300 text-lg mb-8 line-clamp-3">
              {featuredMovie.overview}
            </p>

            {getGenres(featuredMovie).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {getGenres(featuredMovie).slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-zinc-800/80 text-zinc-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <Link to={`/movie/${featuredMovie.id}`}>
                <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
              </Link>
              <Link to={`/movie/${featuredMovie.id}`}>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6"
                >
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Movies */}
      {trendingMovies.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-3xl">Trending Now</h2>
            <Link to="/search">
              <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                calculatedRating={movie.calculatedRating}
                isFavorite={favoriteIds.includes(movie.id)}
                onFavoriteChange={async () => {
                  // Refresh favorites when changed
                  if (isLoggedIn) {
                    try {
                      const favorites = await favoritesAPI.getAll();
                      const ids = favorites.map((f: any) => f.movie_id);
                      setFavoriteIds(ids);
                    } catch (error) {
                      // Silently fail
                    }
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Now in Cinemas */}
      {nowInCinemas.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-white text-3xl mb-2">Now in Cinemas</h2>
              <p className="text-zinc-400">Currently showing in theaters across Finland</p>
            </div>
            <Link to="/now-in-cinemas">
              <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowInCinemas.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                calculatedRating={movie.calculatedRating}
                isFavorite={favoriteIds.includes(movie.id)}
                onFavoriteChange={async () => {
                  // Refresh favorites when changed
                  if (isLoggedIn) {
                    try {
                      const favorites = await favoritesAPI.getAll();
                      const ids = favorites.map((f: any) => f.movie_id);
                      setFavoriteIds(ids);
                    } catch (error) {
                      // Silently fail
                    }
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-950 to-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white text-4xl mb-4">
            Join the Movie Community
          </h2>
          <p className="text-zinc-300 text-lg mb-8">
            Connect with fellow movie enthusiasts, share reviews, create watchlists, and discover your next favorite film.
          </p>
          <div className="flex justify-center gap-4">
            {!isLoggedIn ? (
              <Link to="/login" className="cursor-pointer">
                <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6 cursor-pointer">
                  Get Started
                </Button>
              </Link>
            ) : (
              <Link to="/search" className="cursor-pointer">
                <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6 cursor-pointer">
                  Discover Movies
                </Button>
              </Link>
            )}
            <Link to="/groups" className="cursor-pointer">
              <Button
                variant="outline"
                className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900 text-lg px-8 py-6 cursor-pointer"
              >
                Browse Groups
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper function to convert TMDb movie to our Movie type
function convertTMDBToMovie(tmdbMovie: TMDBMovie) {
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
    inCinemas: true,
    releaseDate: tmdbMovie.release_date,
  };
}
