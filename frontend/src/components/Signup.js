import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Access your dashboard now.");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Intelligence server unreachable. Try again later.");
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
                  <UserPlus size={32} />
                </div>
                <h2 className="fw-bold gradient-text m-0">Initialize Account</h2>
                <p className="text-muted small mt-2">Set up your price intelligence profile</p>
              </div>
              
              {error && (
                <div className="alert bg-danger bg-opacity-10 border-0 text-danger rounded-4 py-2 small shadow-sm mb-4 d-flex align-items-center" role="alert">
                  <ShieldCheck size={16} className="me-2" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-contrast ps-2">User Identity</label>
                  <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill overflow-hidden px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      name="username"
                      className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                      placeholder="Username"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-contrast ps-2">Email Address</label>
                  <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill overflow-hidden px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                      placeholder="name@intelligence.com"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-contrast ps-2">Security Key</label>
                  <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill overflow-hidden px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                      placeholder="Password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-contrast ps-2">Verify Key</label>
                  <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill overflow-hidden px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                      placeholder="Repeat Password"
                      onChange={handleChange}
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
                      <>Create Account <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="small text-muted mb-0">
                    Existing user? <Link to="/login" className="text-primary fw-bold text-decoration-none hover-underline">Login Here</Link>
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

export default Signup;