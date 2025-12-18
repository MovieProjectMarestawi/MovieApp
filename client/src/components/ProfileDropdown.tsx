import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Users, Heart, Film, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
        <Avatar className="w-9 h-9 border-2 border-zinc-700 hover:border-red-600 transition-colors cursor-pointer">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-zinc-800 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
            <span className="sr-only">{user.email.slice(0, 2).toUpperCase()}</span>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
        <DropdownMenuLabel className="text-zinc-400">
          <div className="flex flex-col gap-1">
            <span className="text-white">{user.email}</span>
            <span className="text-xs text-zinc-500">User ID: {user.id}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => navigate('/')}
          className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/search')}
          className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
        >
          <Film className="w-4 h-4 mr-2" />
          Movies
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/groups')}
          className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          Groups
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/favorites')}
          className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
        >
          <Heart className="w-4 h-4 mr-2" />
          Favorites
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-400 focus:bg-red-950 focus:text-red-400"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
