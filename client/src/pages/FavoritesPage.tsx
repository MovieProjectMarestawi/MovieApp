import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Heart, Share2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MovieCard } from '../components/MovieCard';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { favoritesAPI, moviesAPI } from '../services/api';
import { Movie } from '../types';

export function FavoritesPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const sharedUserId = searchParams.get('user');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'year'>('title');
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<{ id: number; email: string } | null>(null);

  // Tarkistetaan katsotaanko toisen käyttäjän jakamat suosikit
  const isSharedView = !!sharedUserId;

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        let favorites: any[] = [];
        let userData: any = null;

        if (isSharedView) {
          // Haetaan toisen käyttäjän jakamat suosikit backendistä
          const sharedData = await favoritesAPI.getShareable(Number(sharedUserId));
          favorites = sharedData.favorites || [];
          userData = sharedData.user;
          setViewingUser(userData);
        } else {
          // Haetaan oma suosikkilista, jos käyttäjä on kirjautunut
          if (!isLoggedIn) {
            setLoading(false);
            return;
          }
          favorites = await favoritesAPI.getAll();
        }

        // Haetaan jokaisen elokuvan tarkemmat tiedot TMDB:stä
        const moviePromises = favorites.map(async (fav: any) => {
          try {
            const movieData = await moviesAPI.getDetails(fav.movie_id);
            return convertTMDBToMovie(movieData);
          } catch (error) {
            console.error(`Elokuvan haku epäonnistui ID: ${fav.movie_id}`);
            return null;
          }
        });

        const movies = (await Promise.all(moviePromises)).filter((m): m is Movie => m !== null);
        setFavoriteMovies(movies);
      } catch (error: any) {
        console.error('Suosikkien hakeminen epäonnistui');
        toast.error('Suosikkien lataaminen epäonnistui');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, sharedUserId, isSharedView]);

  // Odotetaan, kunnes kirjautumistiedot ovat valmiit
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Ladataan...</div>
      </div>
    );
  }

  // Jos ei ole kirjautunut eikä katsota jaettua listaa  ohjataan login-sivulle
  if (!isLoggedIn && !isSharedView) {
    return <Navigate to="/login" />;
  }

  // Näytetään latausruutu datan hakemisen ajan
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Ladataan...</div>
      </div>
    );
  }

  const viewingUsername = isSharedView ? (viewingUser?.email || 'User') : (user?.email || 'User');

  // Järjestetään elokuvat valitun tavan mukaan (nimi, arvosana, vuosi)
  const sortedMovies = [...favoriteMovies].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.rating - a.rating;
      case 'year':
        return b.year - a.year;
      default:
        return 0;
    }
  });

  const handleShare = async () => {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const shareUrl = `${baseUrl}/favorites?user=${user?.id || '1'}`;

    if (navigator.share) {
      try {
        // Käyttää mobiilin share ikkunaa, jos saatavilla
        await navigator.share({
          title: `${viewingUsername} suosikkielokuvat`,
          text: 'Katso suosikkilistani!',
          url: shareUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Jakaminen epäonnistui');
        }
      }
    } else {
      // Kopioidaan linkki leikepöydälle jos selaimessa ei ole share API:a
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Linkki kopioitu!');
      } catch (error) {
        toast.error('Linkin kopiointi epäonnistui');
      }
    }
  };

  const handleExport = () => {
    // Muodostetaan JSON-tiedosto elokuvista ja ladataan se käyttäjälle
    const data = favoriteMovies.map((m) => ({
      title: m.title,
      year: m.year,
      rating: m.rating,
      genre: m.genre.join(', '),
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-favorite-movies.json';
    a.click();

    toast.success('Suosikit viety onnistuneesti!');
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Sivun yläotsikko ja kuvaus */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-red-600" />
            <h1 className="text-white text-4xl">
              {isSharedView ? `${viewingUsername}'s Favorites` : 'My Favorites'}
            </h1>
          </div>

          <p className="text-zinc-400 text-lg">
            {isSharedView
              ? `Näet käyttäjän ${viewingUsername} suosikkielokuvat`
              : 'Tässä ovat omat suosikkielokuvasi'}
          </p>
        </div>

        {/* Ilmoitus jaetusta näkymästä */}
        {isSharedView && (
          <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-300">
              Näet nyt jaetun suosikkilistan käyttäjältä <span className="text-white">{viewingUsername}</span>
            </p>
          </div>
        )}

        {/* Yläpalkki järjestys jako ja export */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'rating' | 'year')}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2"
            >
              <option value="title">Title</option>
              <option value="rating">Rating</option>
              <option value="year">Year</option>
            </select>
          </div>

          {!isSharedView && (
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share List
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </div>

        {/* Tilastot käyttäjän suosikeista */}
        {favoriteMovies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

            {/* Elokuvien kokonaismäärä */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-3xl text-white mb-2">{favoriteMovies.length}</div>
              <div className="text-zinc-400">Total Movies</div>
            </div>

            {/* Arvosanojen keskiarvo */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-3xl text-white mb-2">
                {(favoriteMovies.reduce((sum, m) => sum + m.rating, 0) / favoriteMovies.length).toFixed(1)}
              </div>
              <div className="text-zinc-400">Avg Rating</div>
            </div>

            {/* Kokonaistoistoaika tunneissa */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-3xl text-white mb-2">
                {Math.round(favoriteMovies.reduce((sum, m) => sum + m.duration, 0) / 60)}h
              </div>
              <div className="text-zinc-400">Total Runtime</div>
            </div>

            {/* Genrejen lukumäärä */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="text-3xl text-white mb-2">
                {new Set(favoriteMovies.flatMap((m) => m.genre)).size}
              </div>
              <div className="text-zinc-400">Different Genres</div>
            </div>
          </div>
        )}

        {/* Elokuvat ruudukossa */}
        {sortedMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900 rounded-lg">
            <Heart className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white text-2xl mb-2">No favorites yet</h3>
            <p className="text-zinc-400 mb-6">
              Start adding movies to your favorites list
            </p>
          </div>
        )}

        {/* Genrejen jakauma */}
        {favoriteMovies.length > 0 && (
          <section className="mt-16">
            <h2 className="text-white text-2xl mb-6">Genre Breakdown</h2>

            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex flex-wrap gap-3">

                {Array.from(new Set(favoriteMovies.flatMap((m) => m.genre))).map((genre) => {
                  const count = favoriteMovies.filter((m) => m.genre.includes(genre)).length;

                  return (
                    <div
                      key={genre}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg"
                    >
                      <span className="text-white">{genre}</span>
                      <span className="text-zinc-400">({count})</span>
                    </div>
                  );
                })}

              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

// Muuntaa TMDB elokuvatiedot Movie tyyppiin
function convertTMDBToMovie(tmdbMovie: any): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    posterUrl: tmdbMovie.poster_path || '',
    rating: tmdbMovie.vote_average,
    year: new Date(tmdbMovie.release_date).getFullYear() || 0,
    genre: tmdbMovie.genres?.map((g: any) => g.name) || [],
    duration: tmdbMovie.runtime || 0,
    description: tmdbMovie.overview,
    director: '',
    cast: [],
    inCinemas: false,
    releaseDate: tmdbMovie.release_date,
  };
}
