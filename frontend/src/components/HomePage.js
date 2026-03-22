import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Laptop, Smartphone, Headphones, ArrowRight, Zap, ShieldCheck, Globe } from "lucide-react";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="reveal">
      {/* HERO SECTION */}
      <section className="hero-section py-5 mb-5">
        <div className="container text-center">
          {/* Badge */}
          <div className="d-inline-flex align-items-center gap-2 bg-glass px-3 py-2 rounded-pill mb-4 border border-primary border-opacity-25 shadow-sm">
            <Zap size={16} className="text-primary" fill="currentColor" />
            <span className="small fw-bold text-primary text-uppercase letter-spacing-1">Next-Gen Price Tracking</span>
          </div>
          
          <h1 className="display-3 fw-bold mb-3 text-contrast">
            Product Price <br />
            <span className="gradient-text">Intelligence System</span>
          </h1>
          
          <p className="lead mx-auto mb-5 text-muted" style={{ maxWidth: "700px" }}>
            Harness the power of AI to scan multiple marketplaces instantly. 
            Find the lowest prices, track history, and secure the best deals with precision.
          </p>

          <div className="d-flex justify-content-center gap-3 mb-5">
            <button 
              className="btn-modern px-5 py-3 shadow-lg d-flex align-items-center gap-2"
              onClick={() => navigate("/compare")}
            >
              Start Analyzing Now <ArrowRight size={20} />
            </button>
          </div>

          {/* Hero Image with Glass Panels */}
          <div className="hero-img-container mt-4 position-relative">
            <div className="glass-panel p-2 d-inline-block shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1593642634443-44adaa06623a"
                alt="Market intelligence dashboard"
                className="img-fluid rounded-4 floating-animation"
                style={{ maxWidth: "800px" }}
              />
            </div>
            
            {/* Contextual Floating Badges */}
            <div className="position-absolute d-none d-md-block glass-panel p-3 shadow-lg" style={{ top: '15%', right: '5%', minWidth: '140px' }}>
              <ShieldCheck className="text-success mb-1" />
              <div className="fw-bold small text-contrast">AI Verified</div>
              <div className="text-muted extra-small">99.2% Accuracy</div>
            </div>

            <div className="position-absolute d-none d-md-block glass-panel p-3 shadow-lg" style={{ bottom: '10%', left: '0%', minWidth: '140px' }}>
              <Globe className="text-primary mb-1" />
              <div className="fw-bold small text-contrast">Global Sync</div>
              <div className="text-muted extra-small">15+ Marketplaces</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold h1 text-contrast">Intelligence Coverage</h2>
          <p className="text-muted">Specialized neural scanning for premium electronics</p>
        </div>

        <div className="row g-4">
          {[
            { icon: <Laptop size={32} />, title: "Computing", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8", desc: "Monitors workstations, ultra-books, and gaming rigs across all major retailers." },
            { icon: <Smartphone size={32} />, title: "Mobile", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9", desc: "Real-time inventory tracking for flagships and mid-range devices globally." },
            { icon: <Headphones size={32} />, title: "Peripherals", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", desc: "Aggregated price points for high-fidelity audio and smart home ecosystems." }
          ].map((item, idx) => (
            <div key={idx} className="col-md-4">
              <div className="bento-card h-100 reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="mb-4 rounded-4 overflow-hidden shadow-sm" style={{ height: '180px' }}>
                  <img src={item.img} className="w-100 h-100 object-fit-cover hover-zoom" alt={item.title} />
                </div>
                <div className="d-flex align-items-center gap-2 mb-3">
                   <div className="text-primary p-2 bg-primary bg-opacity-10 rounded-3">{item.icon}</div>
                   <h4 className="fw-bold m-0 text-contrast">{item.title}</h4>
                </div>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE RANKING SECTION */}
      <section className="py-5 my-5 bg-glass-surface">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-contrast">Market Intelligence Example</h2>
            <p className="text-muted">How our engine selects the most efficient deal for you</p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* OPTIMAL CARD */}
            <div className="col-md-4">
              <div className="glass-panel h-100 p-0 overflow-hidden border-success border-2 shadow-xl position-relative">
                <div className="bg-success text-white text-center py-2 fw-bold small letter-spacing-1">
                   OPTIMAL VALUE
                </div>
                <div className="p-4 text-center">
                  <img src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7" className="img-fluid rounded-4 mb-3" alt="Laptop" />
                  <h6 className="fw-bold text-contrast mb-3">Latitude Pro Workstation</h6>
                  <div className="bg-success bg-opacity-10 p-3 rounded-4 d-flex justify-content-between align-items-center">
                    <span className="text-success fw-bold small">eBay</span>
                    <span className="text-success h5 fw-bold mb-0">₹42,999</span>
                  </div>
                  <button className="btn-modern w-100 mt-4 py-3" style={{ background: 'var(--accent-success)' }}>Get Best Deal</button>
                </div>
              </div>
            </div>

            {/* STANDARD CARD 1 */}
            <div className="col-md-4">
              <div className="glass-panel h-100 p-4 text-center opacity-75">
                <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853" className="img-fluid rounded-4 mb-3" alt="Laptop" />
                <h6 className="fw-bold text-contrast mb-3">Latitude Pro Workstation</h6>
                <div className="bg-light bg-opacity-10 p-3 rounded-4 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Amazon</span>
                  <span className="text-contrast h5 fw-bold mb-0">₹45,999</span>
                </div>
                <button className="btn btn-outline-secondary w-100 rounded-pill mt-4 py-2 border-2">View Source</button>
              </div>
            </div>

            {/* STANDARD CARD 2 */}
            <div className="col-md-4">
              <div className="glass-panel h-100 p-4 text-center opacity-75">
                <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2" className="img-fluid rounded-4 mb-3" alt="Laptop" />
                <h6 className="fw-bold text-contrast mb-3">Latitude Pro Workstation</h6>
                <div className="bg-light bg-opacity-10 p-3 rounded-4 d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Walmart</span>
                  <span className="text-contrast h5 fw-bold mb-0">₹44,499</span>
                </div>
                <button className="btn btn-outline-secondary w-100 rounded-pill mt-4 py-2 border-2">View Source</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container py-5 my-5">
        <div className="glass-panel p-5 text-center shadow-2xl overflow-hidden position-relative">
          <div className="glow-spotlight"></div>
          <h2 className="fw-bold h1 mb-3 text-contrast position-relative">Ready to start saving?</h2>
          <p className="text-muted mb-5 mx-auto position-relative" style={{ maxWidth: '500px' }}>
            Join thousands of users utilizing AI-driven market intelligence to never overpay again.
          </p>
          <button
            className="btn-modern btn-lg px-5 py-3 shadow-xl position-relative"
            onClick={() => navigate("/compare")}
          >
            Launch Comparison Engine <ArrowRight className="ms-2" size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;