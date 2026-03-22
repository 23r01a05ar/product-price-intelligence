import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, LogIn, ShieldAlert, ArrowRight, Fingerprint } from "lucide-react";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Invalid security credentials");
      }
    } catch (err) {
      setError("Intelligence server offline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Google Verification failed");
      }
    } catch (err) {
      setError("Cloud authentication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 py-5 reveal">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="glass-panel p-0 overflow-hidden shadow-2xl">
            <div className="p-5">
              <div className="text-center mb-5">
                <div className="d-inline-flex p-3 bg-primary bg-opacity-10 rounded-circle mb-3 text-primary">
                  <Fingerprint size={32} />
                </div>
                <h2 className="fw-bold gradient-text m-0">Access Dashboard</h2>
                <p className="text-muted small mt-2">Sign in to your intelligence profile</p>
              </div>
              
              {error && (
                <div className="alert bg-danger bg-opacity-10 border-0 text-danger rounded-4 py-2 small shadow-sm mb-4 d-flex align-items-center" role="alert">
                  <ShieldAlert size={16} className="me-2" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-contrast ps-2">Email Address</label>
                  <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill overflow-hidden px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                      placeholder="name@intelligence.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-contrast ps-2">Security Key</label>
                  <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill overflow-hidden px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-grid mb-4">
                  <button 
                    type="submit" 
                    className="btn-modern py-3 d-flex align-items-center justify-content-center gap-2" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>Authorize Access <LogIn size={18} /></>
                    )}
                  </button>
                </div>

                <div className="hr-text text-center text-muted mb-4 d-flex align-items-center justify-content-center">
                  <hr className="flex-grow-1 opacity-10" /> 
                  <span className="px-3 extra-small fw-bold opacity-50 letter-spacing-1">OR CLOUD SECURE</span> 
                  <hr className="flex-grow-1 opacity-10" />
                </div>

                <div className="d-flex justify-content-center mb-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google Login Failed")}
                    use_fedcm_for_prompt={true}
                    theme={document.documentElement.getAttribute('data-theme') === 'dark' ? "filled_black" : "filled_blue"}
                    shape="pill"
                    width="100%"
                  />
                </div>

                <div className="text-center">
                  <p className="small text-muted mb-0">
                    New operator? <Link to="/signup" className="text-primary fw-bold text-decoration-none hover-underline">Initialize Account</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;