# 🚀 Online Product Price Intelligence System

### **Infosys Springboard Virtual Internship 6.0 | Batch-13**

A high-performance, professional price comparison and intelligence platform. It aggregates real-time data from major e-commerce stores using advanced web scraping and **AI-assisted image recognition for product matching** to provide users with the best deals and market insights.

---

## 🎯 Problem Statement & Solution

**The Problem:**
In today's fragmented e-commerce market, shoppers struggle to find the best prices manually. Dynamic pricing and varying product descriptions across stores (Amazon, Flipkart, Walmart) make manual comparison time-consuming and often inaccurate.

**The Solution:**
This platform automates the entire process. By combining multi-source web scraping with **AI-driven image analysis**, we provide a unified **Glassmorphism dashboard** where users can instantly compare prices, track historical trends via Chart.js, and get smart recommendations based on visual similarity.

---

## ✨ Key Features

* 🔍 Multi-platform price comparison (Amazon, Flipkart, Walmart)
* 🤖 AI-powered product matching using image recognition
* 📊 Price history tracking with interactive charts (Chart.js)
* ❤️ Wishlist system ("Intelligence Vault")
* 🌙 Dark mode + Glassmorphism UI
* 🔐 Google OAuth authentication
* ⚡ Fast API responses with caching

---

## 🔄 Data Flow

* **Frontend:** User submits a search query or uploads a product image
* **Flask API:** Handles requests and dispatches scraping tasks
* **Scrapers:** Fetch product data from multiple platforms
* **AI Layer:** Validates product matches using TensorFlow/OpenCV
* **Database:** Stores results in SQLite via SQLAlchemy
* **Response:** Returns structured JSON to frontend

---

## 🏗️ System Architecture

* **Frontend:** React + Vite (Glassmorphism UI, Dark Mode)
* **Backend:** Flask (API, scraping, AI processing)
* **Database:** SQLite (SQLAlchemy ORM)
* **Authentication:** Google OAuth + Werkzeug security

---

## 🛠️ Technology Stack

| Category | Technologies                        |
| -------- | ----------------------------------- |
| Frontend | React, Bootstrap 5, Chart.js, Axios |
| Backend  | Flask, Flask-CORS, Flask-Caching    |
| AI       | TensorFlow, OpenCV, NumPy, Pillow   |
| Scraping | BeautifulSoup4, Requests            |
| Database | SQLite, SQLAlchemy                  |
| Tools    | Git, GitHub, VS Code, Postman       |

---

## ✅ Pre-run Checklist

* Python 3.9+ installed
* Node.js installed
* `uploads/` folder exists in backend
* Ports available:

  * Frontend → `5173`
  * Backend → `5000`

---

## 🔑 Environment Variables

Create a `.env` file in `/backend`:

```env
SQLALCHEMY_DATABASE_URI=sqlite:///intelligence.db
SECRET_KEY=dev-secret-key-change-me
GOOGLE_CLIENT_ID=your_google_id_here
```

---

## 🚀 Quick Start

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

* `GET /api/compare-prices?product=laptop`
* `POST /api/upload-image`
* `GET /api/price-history?product_id=1`
* `POST /api/wishlist`

---

## 🛠️ Troubleshooting

* Import errors → check `__init__.py`
* Dark mode issues → verify CSS reset
* DB errors → ensure write permissions
* Scraping blocked → update headers or retry

---

## 📸 Screenshots

(https://drive.google.com/drive/folders/18DV5u3IYKk3hqJI6MyI-1C5lJ1TWlCxy?usp=drive_link)

---

## 🤝 Contribution Guidelines

* Branch naming → `feature/your-name`
* Commit format → `Milestone: Description`
* Follow PEP8 (Python) & ESLint (React)

---

## 👨‍💻 Author

**K.S.S. Vallabha**
Infosys Springboard Internship – Batch 13

---
