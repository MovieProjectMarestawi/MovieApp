import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Film, Heart, Users, Star, Calendar, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { MovieCard } from '../components/MovieCard';
import { GroupCard } from '../components/GroupCard';
import { favoritesAPI, reviewsAPI, groupsAPI, moviesAPI } from '../services/api';
import { Movie } from '../types';
import { toast } from 'sonner';

interface UserGroup {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  owner_email: string;
  member_count: number;
  created_at: string;
  is_member: boolean;
  is_owner: boolean;
  first_movie_id?: number | null;
  imageUrl?: string;
}

export function ProfilePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!isLoggedIn || !user) {
        // Jos käyttäjä ei ole kirjautunut, ei haeta mitään
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Haetaan käyttäjän suosikit
        const favorites = await favoritesAPI.getAll();
        setFavoritesCount(favorites.length);

        // Ladataan ensimmäiset 5 leffaa profiilin esikatseluun
        if (favorites.length > 0) {
          const { moviesAPI } = await import('../services/api');
          const movieDetailsPromises = favorites.slice(0, 5).map(async (fav: any) => {
            try {
              const movieDetail = await moviesAPI.getDetails(fav.movie_id);
              return {
                id: movieDetail.id,
                title: movieDetail.title,
                posterUrl: movieDetail.poster_path || '',
                rating: movieDetail.vote_average,
                year: new Date(movieDetail.release_date).getFullYear() || 0,
                genre: movieDetail.genres?.map((g: any) => g.name) || [],
                duration: movieDetail.runtime || 0,
                description: movieDetail.overview,
                director: '',
                cast: [],
                inCinemas: false,
                releaseDate: movieDetail.release_date,
              } as Movie;
            } catch (error) {
              // Jos jonkun elokuvan lataus epäonnistuu, jatketaan ilman sitä
              return null;
            }
          });

          const resolved = await Promise.all(movieDetailsPromises);
          setFavoriteMovies(resolved.filter((m): m is Movie => m !== null));
        }

        // Haetaan käyttäjän kirjoittamien arvostelujen määrä
        try {
          const reviewsData = await reviewsAPI.getAll(undefined, 1, 100, user.id);
          const totalReviews = reviewsData.pagination?.total ?? reviewsData.reviews?.length ?? 0;
          setReviewsCount(totalReviews);
        } catch (error) {
          console.error('Review count error');
        }

        // Haetaan ryhmät joissa käyttäjä on mukana tai omistaja
        try {
          const allGroups = await groupsAPI.getAll(1, 1000);
          const myGroups = allGroups.groups?.filter((g: any) => g.is_member || g.owner_id === user.id) || [];
          setGroupsCount(myGroups.length);

          // Haetaan jokaiselle ryhmälle esikatselukuva jos sellainen on
          const groupsWithImages = await Promise.all(
            myGroups.map(async (group: UserGroup) => {
              if (group.first_movie_id) {
                try {
                  const movieData = await moviesAPI.getDetails(group.first_movie_id);
                  return {
                    ...group,
                    imageUrl: movieData.poster_path || '',
                  };
                } catch {
                  return { ...group, imageUrl: '' };
                }
              }
              return { ...group, imageUrl: '' };
            })
          );

          setUserGroups(groupsWithImages);
        } catch {
          console.error('Group load error');
        }

      } catch {
        toast.error('Profile data failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [isLoggedIn, user]);

  // Odotetaan authtilan latautumista
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Jos ei kirjautunut  ohjataan login-sivulle
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" />;
  }

  const joinDate = user.created_at ? new Date(user.created_at) : new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Profiilin yläosa  avatar  tiedot */}
      <div className="bg-gradient-to-b from-zinc-900 to-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            {/* Käyttäjän avatar-kuva */}
            <Avatar className="w-32 h-32 border-4 border-zinc-700">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-red-600 flex items-center justify-center">
                <User className="w-12 h-12 text-zinc-300" />
              </AvatarFallback>
            </Avatar>

            {/* Käyttäjän perustiedot */}
            <div className="flex-1">
              <h1 className="text-white text-4xl mb-2">{user.email.split('@')[0]}</h1>
              <p className="text-zinc-400 mb-4">{user.email}</p>

              {/* Liittymisajankohta */}
              <div className="flex items-center gap-2 text-zinc-400 mb-6">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Asetukset  profiilin muokkaus */}
              <Link to="/settings" className="cursor-pointer">
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profiilin tilastot suosikit  ryhmät arvostelut */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          
          {/* Suosikit */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-red-600" />
              <div className="text-3xl text-white">{favoritesCount}</div>
            </div>
            <div className="text-zinc-400">Favorite Movies</div>
          </div>

          {/* Ryhmät */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <div className="text-3xl text-white">{groupsCount}</div>
            </div>
            <div className="text-zinc-400">Groups Joined</div>
          </div>

          {/* Arvostelut */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-600" />
              <div className="text-3xl text-white">{reviewsCount}</div>
            </div>
            <div className="text-zinc-400">Reviews Written</div>
          </div>

          {/* Katsotut elokuvat laskettu suosikkien mukaan tässä UIss */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Film className="w-6 h-6 text-purple-600" />
              <div className="text-3xl text-white">{favoritesCount}</div>
            </div>
            <div className="text-zinc-400">Movies Watched</div>
          </div>
        </div>

        {/* Käyttäjän ryhmät */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl">My Groups</h2>
            <Link to="/groups" className="cursor-pointer">
              <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900 cursor-pointer">
                Browse All Groups
              </Button>
            </Link>
          </div>

          {userGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={{
                    id: group.id,
                    name: group.name,
                    description: group.description || '',
                    owner: group.owner_email,
                    ownerId: group.owner_id,
                    members: group.member_count || 0,
                    imageUrl: group.imageUrl || '',
                    isPublic: true,
                    membersList: [],
                    is_member: group.is_member || false,
                  } as any}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900 rounded-lg">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">You haven't joined any groups yet</p>
              <Link to="/groups" className="cursor-pointer">
                <Button className="bg-red-600 hover:bg-red-700 cursor-pointer">
                  Browse Groups
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Viimeisimmät suosikit */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl">Recent Favorites</h2>
            <Link to="/favorites" className="cursor-pointer">
              <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900 cursor-pointer">
                View All
              </Button>
            </Link>
          </div>

          {favoriteMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favoriteMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900 rounded-lg">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No favorite movies yet</p>
              <Link to="/search" className="cursor-pointer">
                <Button className="mt-4 bg-red-600 hover:bg-red-700 cursor-pointer">
                  Discover Movies
                </Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
