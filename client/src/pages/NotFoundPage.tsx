import { Link } from 'react-router-dom';
import { Film, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404-kuva ja otsikko */}
        <div className="mb-8">
          <div className="text-9xl mb-4">🎬</div>
          <h1 className="text-white text-6xl md:text-8xl mb-4">404</h1>
        </div>

        {/* Virheilmoitus käyttäjälle */}
        <h2 className="text-white text-3xl mb-4">Page Not Found</h2>
        <p className="text-zinc-400 text-lg mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted,
          or you may have mistyped the URL.
        </p>

        {/* Toimintapainikkeet (palaa etusivulle tai hae elokuvia) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="cursor-pointer">
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto cursor-pointer">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link to="/search" className="cursor-pointer">
            <Button
              variant="outline"
              className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900 w-full sm:w-auto cursor-pointer"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Movies
            </Button>
          </Link>
        </div>

        {/* Nopeat linkit muihin sivuihin */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 mb-4">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Home
            </Link>
            <Link to="/search" className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Movies
            </Link>
            <Link to="/now-in-cinemas" className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Now in Cinemas
            </Link>
            <Link to="/groups" className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Groups
            </Link>
            <Link to="/favorites" className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Favorites
            </Link>
          </div>
        </div>

        {/* Alalogo linkki etusivulle */}
        <div className="mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            <Film className="w-6 h-6" />
            <span className="text-lg">Movie4you</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
