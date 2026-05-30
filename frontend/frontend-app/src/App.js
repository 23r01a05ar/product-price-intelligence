import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";
import "./App.css";

function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = window.localStorage.getItem("opi_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (info) => {
    window.localStorage.setItem("opi_user", JSON.stringify(info));
    setUser(info);
  };

  const logout = () => {
    window.localStorage.removeItem("opi_user");
    setUser(null);
  };

  return { user, login, logout };
}

function Header({ user, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="logo-dot" />
        <span className="brand-text">Online Product Price Intelligence</span>
      </div>
      <nav className="main-nav">
        {user ? (
          <>
            <NavLink to="/home" className="nav-link">
              Home
            </NavLink>
            <NavLink to="/history" className="nav-link">
              History
            </NavLink>
            <NavLink to="/wishlist" className="nav-link">
              Wishlist
            </NavLink>
            <button className="secondary-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" className="nav-link">
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        mode === "register"
          ? { email, password, name }
          : { email, password };
      const endpoint = mode === "register" ? "/api/register" : "/api/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      const userInfo = { email: data.email, name: data.name || "" };
      onAuthSuccess(userInfo);
      navigate("/home", { replace: true });
    } catch {
      setError("Network error during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-main">
      <section className="panel auth-panel">
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="hint">
          Intelligent price comparison across major e‑commerce platforms.
        </p>

        <div className="auth-toggle">
          <button
            className={`secondary-button ${mode === "login" ? "active" : ""}`}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`secondary-button ${
              mode === "register" ? "active" : ""
            }`}
            type="button"
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}
      </section>
    </main>
  );
}

function HomePage({ user }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [results, setResults] = useState([]);
  const [manualQuery, setManualQuery] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setError("");
    setProduct(null);
    setResults([]);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError("");
    setProduct(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/upload-image", {
        method: "POST",
        headers: { "X-User-Email": user.email },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setProduct(data.product);
      if (data.product) {
        setManualQuery(data.product);
      }
      setResults(data.results || []);
    } catch {
      setError("Network error while uploading image.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualQuery.trim()) {
      setError("Please enter a product name.");
      return;
    }
    setLoading(true);
    setError("");
    setProduct(null);
    setResults([]);

    try {
      const params = new URLSearchParams({ product: manualQuery.trim() });
      const res = await fetch(`/api/compare-prices?${params.toString()}`, {
        headers: { "X-User-Email": user.email },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Price comparison failed");
        return;
      }
      setProduct(data.product);
      setResults(data.results || []);
    } catch {
      setError("Network error while fetching prices.");
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (offer) => {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          product_name: offer.product_name || offer.title || "",
          store_name: offer.platform || offer.source || offer.store_name || "",
          price: offer.price,
          url: offer.product_url || offer.link || "",
        }),
      });
    } catch {
      // ignore for now
    }
  };

  return (
    <main className="app-main">
      <section className="panel panel-left">
        <h2>Find the best price</h2>
        <p className="hint">
          Upload a product photo or search by name. We’ll scan connected
          platforms and highlight the best live offer.
        </p>

        <label className="upload-area">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            hidden
          />
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="preview-image" />
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">📷</span>
              <span>Click to choose an image</span>
              <span className="upload-subtext">
                JPG, PNG or WebP up to 10MB
              </span>
            </div>
          )}
        </label>

        <button
          className="primary-button"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Searching best prices..." : "Search by image"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="manual-search">
          <label>Search by product name</label>
          <div className="manual-input-row">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="e.g. Apple iPhone 14 128GB"
            />
            <button
              className="secondary-button"
              onClick={handleManualSearch}
              disabled={loading}
            >
              Go
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
      </section>

      <section className="panel panel-right">
        <h2>Live offers</h2>
        {product && (
          <div className="product-summary">
            <span className="label">Detected product:</span>
            <span className="value">{product}</span>
          </div>
        )}

        {loading && (
          <div className="loader">
            <div className="spinner" />
            <span>Fetching live offers...</span>
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="empty-state">
            No results yet. Upload an image or search by name to see live
            offers.
          </p>
        )}

        {!loading && results.length > 0 && (
          <>
            {(() => {
              const best = results.find((o) => o.is_best);
              const others = results.filter((o) => o !== best);
              return (
                <>
                  {best && (
                    <article className="offer-card best-offer main-best-offer">
                      <div className="offer-header">
                        <span className="store-name">
                          {best.platform ||
                            best.source ||
                            best.store_name}
                        </span>
                        <span className="best-badge">Best price</span>
                      </div>
                      <h3 className="offer-title">
                        {best.product_name || best.title}
                      </h3>
                      <p className="offer-price">
                        {best.price ? best.price : "See listing"}
                      </p>
                      <p className="offer-meta">
                        {best.shipping || "Shipping info on listing"}
                      </p>
                      <div className="offer-actions">
                        <button
                          className="secondary-button"
                          onClick={() => addToWishlist(best)}
                        >
                          Add to wishlist
                        </button>
                        <a
                          className="view-deal"
                          href={best.product_url || best.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View deal
                        </a>
                      </div>
                    </article>
                  )}
                  {others.length > 0 && (
                    <>
                      <p className="hint">Other matching offers</p>
                      <div className="results-grid">
                        {others.map((offer, idx) => (
                          <article key={idx} className="offer-card">
                            <div className="offer-header">
                              <span className="store-name">
                                {offer.platform ||
                                  offer.source ||
                                  offer.store_name}
                              </span>
                            </div>
                            <h3 className="offer-title">
                              {offer.product_name || offer.title}
                            </h3>
                            <p className="offer-price">
                              {offer.price ? offer.price : "See listing"}
                            </p>
                            <p className="offer-meta">
                              {offer.shipping || "Shipping info on listing"}
                            </p>
                            <div className="offer-actions">
                              <button
                                className="secondary-button"
                                onClick={() => addToWishlist(offer)}
                              >
                                Add to wishlist
                              </button>
                              <a
                                className="view-deal"
                                href={offer.product_url || offer.link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View deal
                              </a>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}
      </section>
    </main>
  );
}

function HistoryPage({ user }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams({ email: user.email });
      const res = await fetch(`/api/search-history?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.history || []);
      }
    };
    load();
  }, [user.email]);

  return (
    <main className="page-main">
      <section className="panel page-panel">
        <h2>Search history</h2>
        <p className="hint">
          Your recent product lookups with timestamps. Used to power
          recommendations and alerts.
        </p>
        {items.length === 0 ? (
          <p className="empty-state">No history yet.</p>
        ) : (
          <ul className="history-list">
            {items.map((h, idx) => (
              <li key={idx}>
                <span>{h.product_name || h.query}</span>
                <span className="history-time">
                  {new Date(h.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function WishlistPage({ user }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams({ email: user.email });
      const res = await fetch(`/api/wishlist?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setItems(data.wishlist || []);
      }
    };
    load();
  }, [user.email]);

  return (
    <main className="page-main">
      <section className="panel page-panel">
        <h2>Wishlist</h2>
        <p className="hint">
          Saved offers you want to watch. Open listings directly when the price
          looks right.
        </p>
        {items.length === 0 ? (
          <p className="empty-state">No items in wishlist.</p>
        ) : (
          <ul className="wishlist-list">
            {items.map((w, idx) => (
              <li key={idx}>
                <a href={w.url} target="_blank" rel="noreferrer">
                  {w.product_name} – {w.store_name}
                </a>
                {w.price && <span> ₹{w.price}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function App() {
  const { user, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="app">
        <Header user={user} onLogout={logout} />
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/home" replace />
              ) : (
                <AuthPage onAuthSuccess={login} />
              )
            }
          />
          <Route
            path="/home"
            element={
              user ? <HomePage user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/history"
            element={
              user ? (
                <HistoryPage user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/wishlist"
            element={
              user ? (
                <WishlistPage user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={user ? "/home" : "/login"} replace />
            }
          />
        </Routes>
        <footer className="app-footer" />
      </div>
    </BrowserRouter>
  );
}

export default App;

