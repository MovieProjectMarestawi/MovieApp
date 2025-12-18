import { useEffect, useState } from 'react';
import { Film, MapPin } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { moviesAPI } from '../services/api';
import { toast } from 'sonner';
import { Movie } from '../types';

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

export function NowInCinemasPage() {
  const [cinemasMovies, setCinemasMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await moviesAPI.getNowPlaying('FI', 1);
        const movies = (data.results || []).map(convertTMDBToMovie);
        setCinemasMovies(movies);
      } catch (error: any) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-10 h-10 text-red-600" />
            <h1 className="text-white text-4xl">Now in Cinemas</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Currently showing in theaters across Finland
          </p>
          <div className="flex items-center gap-2 mt-2 text-zinc-500">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Available at Finnkino, Cinamon, and local theaters</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">{cinemasMovies.length}</div>
            <div className="text-zinc-400">Movies in Theaters</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">15+</div>
            <div className="text-zinc-400">Theater Locations</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">New</div>
            <div className="text-zinc-400">This Week</div>
          </div>
        </div>

        {/* Featured This Week */}
        {cinemasMovies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white text-2xl mb-6">Featured This Week</h2>
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 flex-shrink-0">
                  <img
                    src={cinemasMovies[0].posterUrl}
                    alt={cinemasMovies[0].title}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white text-2xl mb-2">{cinemasMovies[0].title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {cinemasMovies[0].genre.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                      New Release
                    </span>
                  </div>
                  <p className="text-zinc-300 mb-4 line-clamp-3">
                    {cinemasMovies[0].description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-zinc-400 text-sm">
                    <span>⭐ {cinemasMovies[0].rating.toFixed(1)}/10</span>
                    {cinemasMovies[0].duration > 0 && <span>🕐 {cinemasMovies[0].duration} min</span>}
                    <span>📅 {cinemasMovies[0].year}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Movies */}
        <section>
          <h2 className="text-white text-2xl mb-6">All Movies in Cinemas</h2>
          {cinemasMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {cinemasMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900 rounded-lg">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-white text-2xl mb-2">No movies currently in cinemas</h3>
              <p className="text-zinc-400">Check back soon for new releases!</p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-16 bg-gradient-to-r from-red-950 to-zinc-950 rounded-lg p-8">
          <h2 className="text-white text-2xl mb-4">Where to Watch</h2>
          <p className="text-zinc-300 mb-6">
            These movies are currently showing in theaters across Finland. Visit your local cinema's website to check showtimes and book tickets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-white mb-2">Finnkino</h3>
              <p className="text-zinc-400 text-sm">Finland's largest cinema chain</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-white mb-2">Cinamon</h3>
              <p className="text-zinc-400 text-sm">Modern multiplex experience</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-white mb-2">Local Theaters</h3>
              <p className="text-zinc-400 text-sm">Independent and art house cinemas</p>
            </div>
          </div>
        </section>
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
    inCinemas: true,
    releaseDate: tmdbMovie.release_date,
  };
}
