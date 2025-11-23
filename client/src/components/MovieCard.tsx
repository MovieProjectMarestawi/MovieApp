import { Link } from 'react-router-dom';
import { Star, Heart, Clock, X, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI, groupsAPI } from '../services/api';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AddToGroupModal } from './AddToGroupModal';
import { toast } from 'sonner';

interface MovieCardProps {
  movie: Movie;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  calculatedRating?: number | null; // User-generated rating (1-10 scale)
  isFavorite?: boolean; // Optional: if provided, use this instead of checking
  onFavoriteChange?: () => void; // Optional: callback when favorite status changes
}

export function MovieCard({ movie, onRemove, showRemoveButton, calculatedRating, isFavorite: isFavoriteProp, onFavoriteChange }: MovieCardProps) {
  const { isLoggedIn } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasGroups, setHasGroups] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);

  // Use prop if provided, otherwise check favorites
  const favoriteStatus = isFavoriteProp !== undefined ? isFavoriteProp : isFavorite;

  // Check if movie is in favorites (only if prop not provided)
  useEffect(() => {
    if (isFavoriteProp !== undefined) {
      // Prop provided, don't check
      return;
    }
    const checkFavorite = async () => {
      if (!isLoggedIn) {
        setIsFavorite(false);
        return;
      }
      try {
        const favorites = await favoritesAPI.getAll();
        const favoriteIds = favorites.map((f: any) => f.movie_id);
        setIsFavorite(favoriteIds.includes(movie.id));
      } catch (error) {
        // Silently fail
      }
    };
    checkFavorite();
  }, [isLoggedIn, movie.id, isFavoriteProp]);

  // Check if user has groups
  useEffect(() => {
    const checkGroups = async () => {
      if (!isLoggedIn || showRemoveButton) {
        setHasGroups(false);
        return;
      }
      try {
        const data = await groupsAPI.getAll(1, 1000);
        const userGroups = data.groups?.filter((g: any) => g.is_member) || [];
        setHasGroups(userGroups.length > 0);
      } catch (error) {
        // Silently fail
        setHasGroups(false);
      }
    };
    checkGroups();
  }, [isLoggedIn, showRemoveButton]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error('Please login to add favorites');
      return;
    }
    setLoading(true);
    try {
      if (favoriteStatus) {
        await favoritesAPI.remove(movie.id);
        if (isFavoriteProp === undefined) {
          setIsFavorite(false);
        }
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.add(movie.id);
        if (isFavoriteProp === undefined) {
          setIsFavorite(true);
        }
        toast.success('Added to favorites');
      }
      // Call callback if provided
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600 transition-all duration-300 transform hover:scale-105">
      <Link
        to={`/movie/${movie.id}`}
        className="block"
      >
      {/* Poster Image */}
      <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800">
        <ImageWithFallback
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        {isLoggedIn && !showRemoveButton && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`w-5 h-5 ${favoriteStatus ? 'fill-red-600 text-red-600' : 'text-white'}`}
            />
          </button>
        )}

        {/* Remove Button (for group pages) */}
        {showRemoveButton && onRemove && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-3 right-3 p-2 bg-red-600/90 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
            title="Remove from group"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}

        {/* In Cinemas Badge */}
        {movie.inCinemas && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-xs rounded">
            In Cinemas
          </div>
        )}

        {/* Info on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {movie.duration > 0 && (
            <div className="flex items-center gap-2 text-white text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>{movie.duration} min</span>
            </div>
          )}
          <Button className="w-full bg-red-600 hover:bg-red-700 cursor-pointer mb-2">
            View Details
          </Button>
          {isLoggedIn && hasGroups && !showRemoveButton && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddToGroupModal(true);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white cursor-pointer"
            >
              <Users className="w-4 h-4 mr-2" />
              Add to Group
            </Button>
          )}
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="text-white mb-2 line-clamp-1">{movie.title}</h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-white">
              {calculatedRating !== null && calculatedRating !== undefined
                ? calculatedRating.toFixed(1)
                : movie.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-zinc-400 text-sm">{movie.year}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
      </Link>

      {/* Add to Group Modal */}
      <AddToGroupModal
        open={showAddToGroupModal}
        onClose={() => setShowAddToGroupModal(false)}
        movieId={movie.id}
        movieTitle={movie.title}
      />
    </div>
  );
}

