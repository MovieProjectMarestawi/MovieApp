import { Link } from 'react-router-dom';
import { Users, Lock, Film, Video } from 'lucide-react';
import { Group } from '../types';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GroupCardProps {
  group: Group;
  onJoinClick?: (groupId: number) => void;
}

export function GroupCard({ group, onJoinClick }: GroupCardProps) {
  const { isLoggedIn } = useAuth();
  // isMember is passed from parent component based on API data
  const isMember = (group as any).is_member || false;

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* Group Image */}
      <div className="aspect-video relative overflow-hidden bg-zinc-800 flex items-center justify-center">
        {group.imageUrl && group.imageUrl.trim() !== '' ? (
          <ImageWithFallback
            src={group.imageUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Film className="w-16 h-16 text-zinc-500" />
        )}
        {!group.isPublic && (
          <div className="absolute top-3 right-3 p-2 bg-black/60 rounded-full">
            <Lock className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Group Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white mb-1">{group.name}</h3>
            <p className="text-zinc-400 text-sm line-clamp-2">{group.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-zinc-400 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{Number(group.members) || 0} members</span>
          </div>
          {group.movieCount !== undefined && (
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>{group.movieCount} {group.movieCount === 1 ? 'movie' : 'movies'}</span>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <Link to={`/groups/${group.id}`}>
            {isMember ? (
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                View Group
              </Button>
            ) : (
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  onJoinClick?.(group.id);
                }}
              >
                Join Group
              </Button>
            )}
          </Link>
        )}

        {!isLoggedIn && (
          <Link to="/login">
            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
              Login to Join
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}