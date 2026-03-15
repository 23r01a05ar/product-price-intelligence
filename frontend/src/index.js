import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Import Bootstrap JS for Task 1 Navbar toggler/dropdowns to work
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);