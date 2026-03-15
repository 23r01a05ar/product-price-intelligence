import React, { useState, useEffect } from "react";
import { User, Mail, MessageCircle, Instagram, Globe, Save, Fingerprint } from "lucide-react";
import "./ComparePage.css"; 

function Profile({ user }) {
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    whatsapp_no: "",
    instagram_handle: "", // Task: Added Instagram
    facebook_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user && user.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/profile/${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Intelligence fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage("✅ Intelligence profile updated successfully!");
        const savedUser = JSON.parse(localStorage.getItem("user"));
        localStorage.setItem("user", JSON.stringify({ ...savedUser, username: profile.username }));
      } else {
        setMessage("❌ Update failed.");
      }
    } catch (err) {
      setMessage("❌ Server error. Try again later.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 text-center reveal">
        <div className="glass-panel p-5 d-inline-block">
          <div className="text-warning h4 mb-3">Unauthorized Access</div>
          <p className="text-muted">Please <strong>login</strong> to access your profile vault.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5 reveal">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="main-intelligence-card overflow-hidden">
            <div className="dashboard-header p-5 text-center">
              <div className="d-inline-flex p-3 bg-primary bg-opacity-10 rounded-circle mb-3 text-primary">
                <Fingerprint size={40} />
              </div>
              <h2 className="fw-bold gradient-text m-0">Profile Intelligence</h2>
              <p className="text-muted small mt-2">Manage your operator identity and social sync</p>
            </div>
            
            <div className="p-4 p-md-5 pt-0">
              {message && (
                <div className={`alert ${message.includes('✅') ? 'alert-success bg-soft-success' : 'alert-danger bg-soft-danger'} border-0 rounded-4 py-3 small shadow-sm mb-4`}>
                  {message}
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="row g-4">
                    {/* Identity Group */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-contrast ps-2">Username</label>
                      <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill px-3">
                        <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-contrast ps-2">Registered Email</label>
                      <div className="input-group glass-panel border-0 bg-light bg-opacity-5 rounded-pill px-3 opacity-75">
                        <span className="input-group-text bg-transparent border-0 text-muted pe-1">
                          <Mail size={18} />
                        </span>
                        <input 
                          type="email" 
                          className="form-control bg-transparent border-0 py-3 text-contrast shadow-none" 
                          value={profile.email} 
                          disabled 
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-contrast ps-2">Bio / Status</label>
                      <textarea
                        className="form-control glass-panel border-0 bg-light bg-opacity-10 rounded-4 p-3 text-contrast shadow-none"
                        rows="3"
                        placeholder="Define your operator status..."
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      ></textarea>
                    </div>

                    {/* Social Sync Group */}
                    <div className="col-12">
                      <div className="hr-text text-center text-muted my-4 d-flex align-items-center">
                        <hr className="flex-grow-1 opacity-10" /> 
                        <span className="px-3 extra-small fw-bold opacity-50 letter-spacing-1">SOCIAL CONFIGURATION</span> 
                        <hr className="flex-grow-1 opacity-10" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-contrast ps-2">WhatsApp Integration</label>
                      <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill px-3">
                        <span className="input-group-text bg-transparent border-0 text-success pe-1">
                          <MessageCircle size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                          placeholder="e.g., 919876543210"
                          value={profile.whatsapp_no}
                          onChange={(e) => setProfile({ ...profile, whatsapp_no: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-contrast ps-2">Instagram Sync</label>
                      <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill px-3">
                        <span className="input-group-text bg-transparent border-0 text-danger pe-1">
                          <Instagram size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                          placeholder="@instagram_handle"
                          value={profile.instagram_handle}
                          onChange={(e) => setProfile({ ...profile, instagram_handle: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-contrast ps-2">Legacy Facebook URL</label>
                      <div className="input-group glass-panel border-0 bg-light bg-opacity-10 rounded-pill px-3">
                        <span className="input-group-text bg-transparent border-0 text-primary pe-1">
                          <Globe size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-transparent border-0 py-3 text-contrast shadow-none"
                          placeholder="https://facebook.com/identity"
                          value={profile.facebook_url}
                          onChange={(e) => setProfile({ ...profile, facebook_url: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-12 mt-4">
                      <button 
                        type="submit" 
                        className="btn-modern w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
                        disabled={saving}
                      >
                        {saving ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>Synchronize Changes <Save size={18} /></>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;