import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { 
  Home, 
  BarChart2, 
  History as HistoryIcon, 
  Heart, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon,
  Zap
} from "lucide-react";

// Components
import HomePage from "./components/HomePage";
import ComparePage from "./components/ComparePage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import History from "./components/History";
import Wishlist from "./components/Wishlist";
import Profile from "./components/Profile";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <div className="App">
          {/* MODERN FLOATING NAVBAR */}
          <nav className="navbar navbar-expand-lg sticky-top mx-lg-4 mt-lg-3 px-4 py-2">
            <div className="container-fluid">
              <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                <div className="bg-primary rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm">
                  <Zap size={18} color="white" fill="white" />
                </div>
                <span className="gradient-text fs-4 mb-0">PriceIntel</span>
              </Link>

              <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ps-lg-4">
                  <li className="nav-item">
                    <Link to="/" className="nav-link d-flex align-items-center gap-2">
                      <Home size={18} /> Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/compare" className="nav-link d-flex align-items-center gap-2">
                      <BarChart2 size={18} /> Compare
                    </Link>
                  </li>
                  {user && (
                    <>
                      <li className="nav-item">
                        <Link to="/history" className="nav-link d-flex align-items-center gap-2">
                          <HistoryIcon size={18} /> History
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/wishlist" className="nav-link d-flex align-items-center gap-2">
                          <Heart size={18} /> Wishlist
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                <div className="d-flex align-items-center gap-3">
                  {/* SMART THEME TOGGLE */}
                  <button className="theme-toggle-btn border-0" onClick={toggleTheme} title="Switch Theme">
                    {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                  </button>

                  {!user ? (
                    <div className="d-flex gap-2">
                      <Link to="/login" className="btn btn-link text-decoration-none text-contrast fw-bold">Login</Link>
                      <Link to="/signup" className="btn-modern text-decoration-none">Sign Up</Link>
                    </div>
                  ) : (
                    <div className="dropdown">
                      <button 
                        className="btn-modern d-flex align-items-center gap-2 px-3 dropdown-toggle shadow-none" 
                        type="button" 
                        data-bs-toggle="dropdown"
                      >
                        <UserIcon size={18} /> {user.username}
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end glass-panel border-0 shadow-lg mt-2 p-2">
                        <li>
                          <Link className="dropdown-item rounded-3 d-flex align-items-center gap-2" to="/profile">
                            <UserIcon size={16} /> Profile
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider opacity-10" /></li>
                        <li>
                          <button className="dropdown-item rounded-3 d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* MAIN CONTENT AREA */}
          <main className="content-area py-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/compare" element={<ComparePage user={user} />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/history" element={<History user={user} />} />
              <Route path="/wishlist" element={<Wishlist user={user} />} />
              <Route path="/profile" element={<Profile user={user} />} />
            </Routes>
          </main>

          <footer className="py-5 mt-5">
            <div className="container text-center">
              <p className="text-muted mb-0 small">
                © 2026 Online Product Price Intelligence System • Built with Intelligence
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;