import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  History as HistoryIcon, 
  RefreshCw, 
  Search, 
  Clock, 
  PlayCircle, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import "./History.css";

function History({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/user-history/${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.history || []);
      } else {
        setError(data.message || "Failed to retrieve intelligence logs.");
      }
    } catch (err) {
      setError("Sync Error: Could not connect to the intelligence system.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReSearch = (query) => {
    navigate(`/compare?product=${encodeURIComponent(query)}`);
  };

  if (!user) {
    return (
      <div className="container mt-5 text-center reveal">
        <div className="glass-panel p-5 d-inline-block">
          <AlertCircle size={48} className="text-warning mb-3 opacity-50" />
          <h4 className="text-contrast fw-bold">Access Restricted</h4>
          <p className="text-muted">Please <strong>login</strong> to view your intelligence logs.</p>
          <Link to="/login" className="btn-modern d-inline-flex align-items-center gap-2 mt-3 text-decoration-none">
            Authenticate <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5 reveal">
      <div className="main-intelligence-card overflow-hidden">
        <div className="dashboard-header p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold gradient-text m-0">Intelligence Logs</h2>
              <p className="text-muted small mb-0">Audit trail of all previous marketplace scans</p>
            </div>
            <button 
              className="btn btn-modern d-flex align-items-center gap-2 px-4 shadow-sm" 
              onClick={fetchHistory} 
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} /> 
              {loading ? "Syncing..." : "Refresh Logs"}
            </button>
          </div>
        </div>

        <div className="p-4 p-md-5 pt-0">
          {error && (
            <div className="alert bg-danger bg-opacity-10 border-0 text-danger rounded-4 py-3 shadow-sm mb-4 d-flex align-items-center">
              <AlertCircle size={18} className="me-2" /> {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 fw-bold text-muted animate-pulse">Decrypting search history...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="history-list d-flex flex-column gap-3">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className="glass-panel p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center hover-lift border-0 shadow-sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleReSearch(item.query)}
                >
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3 d-flex align-items-center justify-content-center">
                      <Search size={20} />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-contrast text-capitalize">{item.query}</h6>
                      <div className="d-flex align-items-center gap-2 text-muted extra-small mt-1">
                        <Clock size={12} />
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 mt-md-0">
                    <div className="badge-best-value rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                       <PlayCircle size={16} />
                       <span className="small fw-bold">RE-RUN ANALYSIS</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 glass-panel border-0 bg-light bg-opacity-5">
              <div className="d-inline-flex p-4 bg-light bg-opacity-10 rounded-circle mb-4 text-muted">
                <HistoryIcon size={64} className="opacity-20" />
              </div>
              <h4 className="text-contrast fw-bold">No Data Recorded</h4>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: "400px" }}>
                Your intelligence archive is empty. Begin scanning products to build your database.
              </p>
              <button className="btn-modern px-5 py-3" onClick={() => navigate("/compare")}>
                Start First Comparison
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;