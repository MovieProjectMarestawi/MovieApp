import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export function Footer() {
  // heataan tämän vuoden vuosiluku automattisesti
  const currentYear = new Date().getFullYear();

  return (
    /*Footerin style  tausta tumma ja border on käytetty */
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* grit layout 1 sarake mobiilissa mut neljä saraketta isomassa näytössa*/}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* logo sekä nimit */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {/* sivun logoikuna */}
              <Film className="w-8 h-8 text-red-600" />
              <span className="text-2xl text-white font-bold">Movie4you</span>
            </div>
            {/* Selitys about sivusto */}
            <p className="text-zinc-400 mb-4 max-w-md">
              Your ultimate destination for discovering, discussing, and sharing your favorite movies.
              Connect with fellow cinephiles and explore the world of cinema together.
            </p>
            {/* some linkit  */}

          </div>

          {/* Linkit missä vie sinne search sekä gropus ja favorites  */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Groups
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* käytkötilin linkit esim profile , settings, login, register */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm">
              © {currentYear} Movie4you. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}
