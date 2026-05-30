import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ExternalLink, ShoppingBag, ArrowRight } from "lucide-react";

function Wishlist({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${user.id}`);
      const data = await res.json();
      setItems(data.wishlist || []);
    } catch (error) {
      console.error("Intelligence Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user, fetchWishlist]);

  const removeItem = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/wishlist/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      }
    } catch (error) {
      alert("Encryption Error: Could not remove item.");
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 text-center reveal">
        <div className="glass-panel p-5 d-inline-block">
          <Heart size={48} className="text-muted mb-3 opacity-20" />
          <h4 className="text-contrast fw-bold">Access Restricted</h4>
          <p className="text-muted">Please <strong>login</strong> to view your saved market intelligence.</p>
          <Link to="/login" className="btn-modern d-inline-flex align-items-center gap-2 mt-3 text-decoration-none">
            Login Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5 reveal">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-5 px-2">
        <div>
          <h2 className="fw-bold gradient-text m-0">Saved Intelligence</h2>
          <p className="text-muted m-0">Monitoring {items.length} high-value targets</p>
        </div>
        <div className="glass-panel px-3 py-2 d-flex align-items-center gap-2">
          <ShoppingBag size={18} className="text-primary" />
          <span className="fw-bold text-contrast">{items.length} Items</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 fw-bold text-muted animate-pulse">Syncing with vault...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className="glass-panel h-100 overflow-hidden d-flex flex-column hover-lift border-0">
                {/* Product Image Area */}
                <div className="position-relative p-4 bg-white d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                  <img 
                    src={item.image || "https://via.placeholder.com/150"} 
                    className="img-fluid" 
                    style={{ maxHeight: "100%", objectFit: "contain" }} 
                    alt={item.title} 
                  />
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 shadow-sm">
                      {item.store}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <h6 className="fw-bold text-contrast text-truncate mb-2" title={item.title}>
                    {item.title}
                  </h6>
                  <div className="h4 fw-bold text-success mb-4">{item.price}</div>
                  
                  <div className="d-flex gap-2 mt-auto">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-bold"
                    >
                      View Deal <ExternalLink size={16} />
                    </a>
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="btn-icon-round text-danger bg-danger bg-opacity-10"
                      title="Remove from vault"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-5 text-center shadow-lg border-0 reveal">
          <div className="py-4">
            <div className="d-inline-flex p-4 bg-light bg-opacity-10 rounded-circle mb-4">
               <Heart size={64} className="text-muted opacity-20" />
            </div>
            <h3 className="text-contrast fw-bold">Vault is Empty</h3>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: "400px" }}>
              You haven't flagged any items for monitoring yet. Start comparing to build your wishlist.
            </p>
            <Link to="/compare" className="btn-modern text-decoration-none d-inline-flex align-items-center gap-2">
              Launch Comparison Engine <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;