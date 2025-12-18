import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MovieSearchPage } from "./pages/MovieSearchPage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { NowInCinemasPage } from "./pages/NowInCinemasPage";
import { GroupsListPage } from "./pages/GroupsListPage";
import { GroupDetailPage } from "./pages/GroupDetailPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Toaster } from "./components/ui/sonner";
import { Footer } from "./components/Footer";

// Layout component for routes with navbar
function LayoutWithNavbar() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<MovieSearchPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/now-in-cinemas" element={<NowInCinemasPage />} />
          <Route path="/groups" element={<GroupsListPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="dark min-h-screen bg-black">
          <Routes>
            {/* Routes without navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes with navbar */}
            <Route path="/*" element={<LayoutWithNavbar />} />
          </Routes>
          <Toaster theme="dark" />
        </div>
      </Router>
    </AuthProvider>
  );
}
