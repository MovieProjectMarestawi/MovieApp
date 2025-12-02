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
import { MovieSearchPage } from "./pages/MovieSearchPage";
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
          
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
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

