import { Link, useLocation } from 'react-router-dom';
import { Film, Home, Users, Heart, User, LogIn, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from './ui/button';

export function Navbar() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Movies', icon: Film },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <Film className="w-8 h-8 text-red-600" />
            <span className="text-xl text-white">Movie4you</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive(link.path)
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationDropdown />
                <ProfileDropdown />
              </>
            ) : (
              <Link to="/login" className="cursor-pointer">
                <Button className="bg-red-600 hover:bg-red-700 cursor-pointer">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around pb-3 gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 cursor-pointer ${
                  isActive(link.path)
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

