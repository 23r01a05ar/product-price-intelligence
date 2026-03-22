import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Upload, RefreshCw, TrendingUp, Heart, 
  Bell, Share2, ExternalLink, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import "./ComparePage.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function ComparePage({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searchName, setSearchName] = useState(""); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); 
  const [productData, setProductData] = useState(null); 
  const [deals, setDeals] = useState({ amazon: [], walmart: [], flipkart: [] }); 
  const [stats, setStats] = useState(null); 
  const [historyChartData, setHistoryChartData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [alertEmail, setAlertEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [activeAlertRow, setActiveAlertRow] = useState(null); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 
  const maxPages = 5;

  const fetchPriceHistory = useCallback(async (name) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/price-history?product_id=${encodeURIComponent(name)}`);
      const data = await response.json();
      if (data.history && data.history.length > 0) {
        const sortedHistory = [...data.history].reverse();
        setHistoryChartData({
          labels: sortedHistory.map(h => h.date),
          datasets: [{
            label: 'Market Trend',
            data: sortedHistory.map(h => parseFloat(String(h.price).replace(/[^0-9.]/g, ""))),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
          }]
        });
      }
    } catch (error) { console.error("History fetch error:", error); }
  }, []);

  const handleRefresh = useCallback(async (name) => {
    if (!name) return;
    setLoading(true);
    setUploadStatus(`Re-scanning markets for ${name}...`);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/compare-prices?product=${encodeURIComponent(name)}&user_id=${user?.id || ""}`);
      const data = await response.json();
      if (response.ok) {
        setDeals({ amazon: data.deals || [], walmart: [], flipkart: [] });
        setStats(data.stats);
        setProductData({ name: data.product, confidence: "Verified" });
        fetchPriceHistory(data.product);
        setMessage("✅ Market intelligence updated.");
      }
    } catch (error) { setMessage("❌ Connection failed."); }
    finally { setLoading(false); setUploadStatus(""); }
  }, [user, fetchPriceHistory]);

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (!searchName.trim()) return;
    resetUI();
    setSearchParams({ product: searchName });
    handleRefresh(searchName);
  };

  useEffect(() => {
    if (user?.id) {
      fetch(`http://127.0.0.1:5000/api/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") setUserProfile(data.profile);
        })
        .catch(err => console.error("Profile fetch error:", err));
    }
  }, [user]);

  useEffect(() => {
    const productQuery = searchParams.get("product");
    if (productQuery && !productData) {
      setSearchName(productQuery);
      handleRefresh(productQuery);
    }
  }, [searchParams, productData, handleRefresh]);

  const handleShare = (platform, deal) => {
    const text = `🔥 Best price for ${deal.title} is ${deal.price} at ${deal.store}!`;
    const url = deal.url;
    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        const waPhone = userProfile?.whatsapp_no ? userProfile.whatsapp_no : "";
        shareUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "twitter":
        const via = userProfile?.twitter_handle ? ` via ${userProfile.twitter_handle}` : "";
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + via)}&url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link secured to clipboard!");
        return;
      default: return;
    }
    window.open(shareUrl, "_blank");
  };

  const isBestItem = (deal) => {
    if (!stats) return false;
    return parseFloat(String(deal.price).replace(/[^0-9.]/g, "")) === parseFloat(stats.lowest);
  };

  const handleSaveToWishlist = async (deal) => {
    if (!user) { alert("Login required to save."); return; }
    try {
      const response = await fetch("http://127.0.0.1:5000/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id, title: deal.title, price: deal.price,
          store: deal.store, url: deal.url, image: deal.image
        }),
      });
      if (response.ok) alert("❤️ Intelligence saved to your vault!");
    } catch (error) { alert("❌ Save failed."); }
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Limit: 10MB"); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    resetUI();
  };

  const resetUI = () => {
    setMessage(""); 
    setProductData(null); 
    setStats(null); 
    setDeals({ amazon: [], walmart: [], flipkart: [] }); 
    setHistoryChartData(null);
    setUploadStatus(""); 
    setCurrentPage(1); 
    setActiveAlertRow(null);
  };

  const handleSetAlert = async (productName) => {
    if (!alertEmail || !targetPrice) { alert("Inputs required."); return; }
    try {
      const response = await fetch("http://127.0.0.1:5000/api/set-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName, target_price: targetPrice, user_email: alertEmail
        }),
      });
      if (response.ok) {
        alert(`🔔 Alert armed for $${targetPrice}!`);
        setActiveAlertRow(null); setAlertEmail(""); setTargetPrice("");
      }
    } catch (error) { alert("❌ Alert failed."); }
  };

  const handleUpload = async () => {
    if (!image) return alert("Select an image");
    setLoading(true); resetUI(); setUploadStatus("AI Neural Analysis in progress...");
    try {
      const formData = new FormData();
      formData.append("image", image);
      if (user) formData.append("user_id", user.id);
      const response = await fetch("http://127.0.0.1:5000/api/upload-image", { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok) {
        setProductData({ name: data.prediction, confidence: data.confidence });
        setDeals(data.deals || { amazon: [], walmart: [], flipkart: [] });
        setStats(data.stats);
        setSearchParams({ product: data.prediction });
        fetchPriceHistory(data.prediction);
        setMessage("✅ Scan successful.");
      } else { setMessage(`❌ Error: ${data.error}`); }
    } catch (error) { setMessage("❌ Server offline."); }
    finally { setLoading(false); setUploadStatus(""); }
  };

  const amazonResults = deals.amazon || [];
  const totalAvailablePages = Math.ceil(amazonResults.length / itemsPerPage);
  const totalPages = totalAvailablePages > maxPages ? maxPages : totalAvailablePages;
  const currentItems = amazonResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="compare-container container mt-5 pb-5">
      <div className="card glass-panel border-0 shadow-2xl p-0 overflow-hidden">
        
        <div className="dashboard-header d-flex justify-content-between align-items-center p-4 border-bottom border-secondary border-opacity-10">
            <div>
                <h3 className="fw-bold gradient-text m-0">Intelligence Engine</h3>
                <p className="text-muted small m-0">Real-time market scanning & analysis</p>
            </div>
            {productData && (
                <button className="btn btn-modern d-flex align-items-center gap-2" onClick={() => handleRefresh(productData.name)} disabled={loading}>
                    <RefreshCw size={18} className={loading ? "spin" : ""} /> Re-Sync Market
                </button>
            )}
        </div>
        
        <div className="p-4">
            <div className="row g-3 mb-4">
                <div className="col-lg-7">
                    <form onSubmit={handleTextSearch} className="search-box-modern d-flex align-items-center p-2 rounded-pill bg-white bg-opacity-10 border border-secondary border-opacity-20">
                        <Search size={20} className="ms-3 text-muted" />
                        <input 
                            type="text" 
                            className="form-control border-0 bg-transparent shadow-none text-contrast" 
                            placeholder="Enter product name..." 
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm">Search</button>
                    </form>
                </div>
                <div className="col-lg-5">
                    <div className="upload-box-modern glass-panel p-2 d-flex align-items-center justify-content-center border-dashed">
                        <label className="d-flex align-items-center gap-2 cursor-pointer w-100 justify-content-center py-2 m-0">
                            <Upload size={18} className="text-primary" />
                            <span className="fw-bold small text-contrast">Visual Search</span>
                            <input type="file" className="d-none" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} disabled={loading} />
                        </label>
                    </div>
                </div>
            </div>

            {preview && !productData && (
                <div className="preview-strip glass-panel p-3 mb-4 reveal d-flex align-items-center gap-4">
                    <div className="position-relative">
                        <img src={preview} alt="p" className="rounded-3 shadow-sm" style={{height: '80px', width: '80px', objectFit: 'cover'}} />
                        <button className="btn btn-danger btn-sm rounded-circle position-absolute top-0 start-100 translate-middle" onClick={() => {setPreview(null); setImage(null)}}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="m-0 fw-bold text-contrast">Visual Data Ready</h6>
                        <p className="text-muted small m-0">Neural engine will identify product details</p>
                    </div>
                    <button className="btn btn-primary rounded-pill px-4" onClick={handleUpload} disabled={loading}>
                        {loading ? "Analyzing..." : "Analyze Image"}
                    </button>
                </div>
            )}

            {productData && !loading && (
                <div className="ai-detection-banner mb-4 d-flex align-items-center p-3 rounded-4 border border-primary border-opacity-20 bg-primary bg-opacity-5">
                    <div className="ai-badge bg-primary text-white px-2 py-1 rounded-2 me-3 fw-bold small">AI</div>
                    <div>
                        <span className="text-muted small d-block">Detected Product</span>
                        <strong className="fs-5 text-contrast">{productData.name}</strong>
                    </div>
                    <div className="ms-auto text-end">
                        <span className="text-muted small d-block">Confidence</span>
                        <span className="badge bg-primary rounded-pill">{productData.confidence}</span>
                    </div>
                </div>
            )}

            <div className="row g-4 mb-4">
              {historyChartData && !loading && (
                <div className="col-lg-8">
                  <div className="bento-card p-4 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="fw-bold m-0 d-flex align-items-center gap-2 text-contrast"><TrendingUp size={18} className="text-primary" /> Market Trend</h6>
                        <span className="badge bg-soft-info text-info">Historical Analytics</span>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Line data={historyChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </div>
                  </div>
                </div>
              )}

              {stats && !loading && (
                <div className="col-lg-4">
                    <div className="d-flex flex-column gap-3 h-100">
                        <div className="stat-pill p-3 rounded-4 border-start border-4 border-success bg-glass shadow-sm">
                            <span className="text-muted small d-block">Market Floor</span>
                            <h3 className="fw-bold m-0 text-success">${stats.lowest}</h3>
                        </div>
                        <div className="stat-pill p-3 rounded-4 border-start border-4 border-primary bg-glass shadow-sm">
                            <span className="text-muted small d-block">Market Average</span>
                            <h3 className="fw-bold m-0 text-primary">${stats.average}</h3>
                        </div>
                        <div className="stat-pill p-3 rounded-4 border-start border-4 border-danger bg-glass shadow-sm">
                            <span className="text-muted small d-block">Market Ceiling</span>
                            <h3 className="fw-bold m-0 text-danger">${stats.highest}</h3>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 fw-bold text-muted animate-pulse">{uploadStatus}</p>
                </div>
            )}

            {message && !loading && <div className={`alert text-center fw-medium border-0 shadow-sm rounded-4 mb-4 ${message.includes('✅') ? 'alert-success bg-soft-success' : 'alert-danger bg-soft-danger'}`}>{message}</div>}

            {!loading && productData && (
              <div className="results-container mt-5 reveal">
                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                  <h4 className="fw-bold m-0 text-contrast">Live Marketplace Results</h4>
                  <div className="view-toggle-pill p-1 d-flex bg-light bg-opacity-10 rounded-pill">
                    <button className={`btn btn-sm rounded-pill px-3 ${viewMode === 'grid' ? 'btn-primary' : 'text-muted'}`} onClick={() => setViewMode('grid')}>Grid</button>
                    <button className={`btn btn-sm rounded-pill px-3 ${viewMode === 'table' ? 'btn-primary' : 'text-muted'}`} onClick={() => setViewMode('table')}>Table</button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="row g-4">
                    {currentItems.map((deal, index) => {
                      const isBest = isBestItem(deal);
                      return (
                        <div key={index} className="col-12">
                          <div className={`deal-card-premium glass-panel p-4 h-100 ${isBest ? 'border-success border-2' : ''}`}>
                            <div className="row align-items-center">
                              <div className="col-auto">
                                <div className="product-img-frame bg-white p-2 rounded-4 shadow-sm" style={{width: '100px', height: '100px'}}>
                                  <img src={deal.image || "https://via.placeholder.com/80"} alt="p" className="w-100 h-100 object-fit-contain" />
                                </div>
                              </div>
                              <div className="col px-md-4">
                                <div className="d-flex align-items-center mb-2 gap-2">
                                    <span className="badge bg-primary bg-opacity-10 text-primary">{deal.store}</span>
                                    {isBest && <span className="badge bg-success">Best Value</span>}
                                </div>
                                <h5 className="fw-bold text-contrast mb-1 text-truncate" style={{maxWidth: '400px'}}>{deal.title}</h5>
                                <div className="h3 fw-bold text-success m-0">{deal.price}</div>
                              </div>
                              <div className="col-md-auto text-end mt-3 mt-md-0 d-flex flex-column gap-2 align-items-md-end">
                                <div className="d-flex gap-2 mb-2">
                                  <button className="btn btn-icon-round" onClick={() => handleSaveToWishlist(deal)} title="Wishlist"><Heart size={18} /></button>
                                  <button className={`btn btn-icon-round ${activeAlertRow === index ? 'bg-danger text-white' : ''}`} onClick={() => setActiveAlertRow(activeAlertRow === index ? null : index)} title="Alert"><Bell size={18} /></button>
                                  <button className="btn btn-icon-round" onClick={() => handleShare('whatsapp', deal)} title="Share"><Share2 size={18} /></button>
                                </div>
                                <a href={deal.url} target="_blank" rel="noopener noreferrer" className="btn btn-modern rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                                  View Source <ExternalLink size={16} />
                                </a>
                              </div>
                            </div>
                            {activeAlertRow === index && (
                              <div className="price-alert-panel p-3 mt-3 rounded-4 bg-light bg-opacity-10 reveal">
                                   <div className="row g-2 align-items-center">
                                      <div className="col-md-5"><input type="email" placeholder="Email Address" className="form-control rounded-pill text-contrast bg-transparent" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} /></div>
                                      <div className="col-md-4"><input type="number" placeholder="Target Price" className="form-control rounded-pill text-contrast bg-transparent" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} /></div>
                                      <div className="col-md-3"><button className="btn btn-primary w-100 rounded-pill" onClick={() => handleSetAlert(deal.title)}>Arm Alert</button></div>
                                   </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="table-responsive glass-panel border-0 rounded-4 overflow-hidden">
                    <table className="table table-hover align-middle mb-0 text-contrast">
                      <thead className="bg-light bg-opacity-10">
                        <tr>
                          <th className="ps-4">Source</th>
                          <th>Product</th>
                          <th>Price</th>
                          <th className="text-center">Social</th>
                          <th className="text-end pe-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((deal, index) => {
                          const isBest = isBestItem(deal);
                          return (
                            <tr key={index} className={isBest ? "bg-success bg-opacity-5" : ""}>
                              <td className="ps-4">
                                <span className="badge bg-secondary bg-opacity-20 text-contrast">{deal.store}</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                    <img src={deal.image || "https://via.placeholder.com/40"} alt="p" className="rounded-2" style={{width: '40px', height: '40px'}} />
                                    <div className="text-truncate fw-medium" style={{maxWidth: '200px'}}>{deal.title}</div>
                                </div>
                              </td>
                              <td><span className="fw-bold text-success">{deal.price}</span></td>
                              <td className="text-center">
                                  <button className="btn btn-link p-1" onClick={() => handleShare('whatsapp', deal)}><Share2 size={16} /></button>
                                  <button className="btn btn-link p-1 text-danger" onClick={() => handleSaveToWishlist(deal)}><Heart size={16} /></button>
                              </td>
                              <td className="text-end pe-4">
                                <a href={deal.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary rounded-pill px-3">
                                   View Deal
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {totalPages > 1 && (
                    <div className="d-flex flex-column align-items-center mt-5">
                      <div className="d-flex justify-content-center align-items-center gap-3">
                          <button className="btn-icon-round" disabled={currentPage === 1} onClick={() => {setCurrentPage(currentPage - 1); window.scrollTo({top: 400, behavior: 'smooth'})}}>
                              <ChevronLeft size={20} />
                          </button>
                          
                          <div className="d-flex gap-2">
                              {[...Array(totalPages).keys()].map(n => (
                                  <button 
                                      key={n + 1}
                                      className={`btn btn-sm rounded-circle fw-bold transition-all ${currentPage === n + 1 ? 'btn-primary scale-110 shadow-lg' : 'btn-outline-secondary opacity-50'}`}
                                      style={{width: '45px', height: '45px'}}
                                      onClick={() => {setCurrentPage(n + 1); window.scrollTo({top: 400, behavior: 'smooth'})}}
                                  >
                                      {n + 1}
                                  </button>
                              ))}
                          </div>

                          <button className="btn-icon-round" disabled={currentPage === totalPages} onClick={() => {setCurrentPage(currentPage + 1); window.scrollTo({top: 400, behavior: 'smooth'})}}>
                              <ChevronRight size={20} />
                          </button>
                      </div>
                      <p className="extra-small text-muted mt-3 fw-bold letter-spacing-1">
                          Showing {currentItems.length} Intelligence Matches
                      </p>
                    </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default ComparePage;