import os
import uuid
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_caching import Cache 
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash 

# Google Auth Imports
from google.oauth2 import id_token
from google.auth.transport import requests

# --- IMAGE & AI IMPORTS ---
# Corrected: Advanced fallback logic to handle folder vs standalone file imports
try:
    # 1. Try importing from a folder named 'preprocessing' containing 'preprocess.py'
    from preprocessing.preprocess import preprocess_image
except (ImportError, ModuleNotFoundError):
    try:
        # 2. Try importing from a folder named 'preprocessing' containing 'preprocessing.py'
        from preprocessing.preprocessing import preprocess_image
    except (ImportError, ModuleNotFoundError):
        try:
            # 3. Try importing from a standalone 'preprocessing.py' file in root
            from preprocessing import preprocess_image
        except ImportError:
            # Final Fallback Placeholder to prevent crash
            def preprocess_image(path): return path

from model_integration import predict_product 

# Search & Comparison Imports
from product_search import get_amazon_prices, get_walmart_prices, get_flipkart_prices
from comparison_engine import compare_prices

# Database & Config Imports
from database import db, Product, Price, PriceAlert, User, SearchHistory, Wishlist
from crud import save_search_query, add_product_with_prices
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret-key-change-me"
CORS(app)

# Replace with your actual Client ID from Google Cloud Console
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE"

# Task 12: Caching Setup
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300})
cache.init_app(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
db.init_app(app)

# Directory Setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- HELPER FUNCTIONS ---

def run_price_alert_check(product_name, current_lowest):
    """Checks if current price is below target price for any user alerts."""
    alerts = db.session.query(PriceAlert).filter_by(product_name=product_name, is_active=True).all()
    for alert in alerts:
        if current_lowest <= alert.target_price:
            print(f"!!! PRICE ALERT TRIGGERED for {alert.user_email} !!!")
            alert.is_active = False
            db.session.commit()

# Ensure database tables are created within App Context
with app.app_context():
    try:
        db.create_all()
        print("✓ Intelligence Database Active.")
    except Exception as e:
        print(f"✗ DB Init Error: {e}")

# --- AUTHENTICATION ENDPOINTS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email', '').strip().lower()
    password = data.get('password')
    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400
    if db.session.query(User).filter_by(email=email).first():
        return jsonify({"status": "error", "message": "Email already exists"}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"status": "success", "message": "User registered"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password')
    user = db.session.query(User).filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            "status": "success", 
            "user": {"id": user.id, "username": user.username, "email": user.email}
        }), 200
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/api/google-login', methods=['POST'])
def google_login():
    data = request.json
    token = data.get('token')
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        username = idinfo.get('name', email.split('@')[0])
        user = db.session.query(User).filter_by(email=email).first()
        if not user:
            user = User(username=username, email=email, password_hash="GOOGLE_AUTH_ACCOUNT")
            db.session.add(user)
            db.session.commit()
        return jsonify({
            "status": "success",
            "user": {"id": user.id, "username": user.username, "email": user.email}
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# --- PROFILE & HISTORY ---

@app.route('/api/profile/<int:user_id>', methods=['GET', 'PUT'])
def profile(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
    
    if request.method == 'PUT':
        data = request.json
        user.username = data.get('username', user.username)
        user.bio = data.get('bio', user.bio)
        user.whatsapp_no = data.get('whatsapp_no', user.whatsapp_no)
        user.twitter_handle = data.get('twitter_handle', user.twitter_handle)
        user.facebook_url = data.get('facebook_url', user.facebook_url)
        db.session.commit()
        return jsonify({"status": "success", "message": "Profile updated"}), 200

    return jsonify({
        "status": "success",
        "profile": {
            "username": user.username, "email": user.email, "bio": user.bio or "",
            "whatsapp_no": user.whatsapp_no or "", "twitter_handle": user.twitter_handle or ""
        }
    }), 200

@app.route('/api/user-history/<int:user_id>', methods=['GET'])
def get_user_history(user_id):
    try:
        history = db.session.query(SearchHistory).filter_by(user_id=user_id)\
                    .order_by(SearchHistory.timestamp.desc()).limit(20).all()
        results = [{"query": h.query, "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M")} for h in history]
        return jsonify({"status": "success", "history": results}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- CORE LOGIC: SEARCH & IMAGE ---

@app.route('/api/compare-prices', methods=['GET'])
@cache.cached(query_string=True)
def get_compare_prices():
    product_name = request.args.get('product')
    u_id = request.args.get('user_id')
    if not product_name:
        return jsonify({"error": "Product name is required"}), 400

    amazon = get_amazon_prices(product_name)
    walmart = get_walmart_prices(product_name)
    flipkart = get_flipkart_prices(product_name)
    all_deals = amazon + walmart + flipkart
    comparison = compare_prices(all_deals)
    
    if comparison['ranked_deals']:
        run_price_alert_check(product_name, float(comparison['stats']['lowest']))
    
    # Clean user_id check
    final_u_id = int(u_id) if (u_id and str(u_id).isdigit()) else None
    
    save_search_query(user_id=final_u_id, query=product_name)
    add_product_with_prices(name=product_name, category="Search", image_url="", deals=all_deals)
    
    return jsonify({
        "status": "success", "product": product_name, "stats": comparison['stats'], "deals": comparison['ranked_deals']
    })

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    u_id = request.form.get('user_id')
    
    if file:
        filename = secure_filename(f"{str(uuid.uuid4())[:8]}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # AI Processing
        preprocess_image(filepath)
        prediction = predict_product(filepath)
        product_name = prediction['label']
        
        all_deals = get_amazon_prices(product_name) + get_walmart_prices(product_name) + get_flipkart_prices(product_name)
        comparison = compare_prices(all_deals)
        
        final_u_id = int(u_id) if (u_id and str(u_id).isdigit()) else None
        save_search_query(user_id=final_u_id, query=product_name)
        
        return jsonify({
            "status": "success", "prediction": product_name, 
            "confidence": prediction['confidence'], "stats": comparison['stats'], 
            "deals": {"amazon": [d for d in comparison['ranked_deals'] if d['store'] == 'Amazon']}
        }), 201

# --- WISHLIST & ALERTS ---

@app.route('/api/wishlist', methods=['GET', 'POST'])
def handle_wishlist():
    if request.method == 'POST':
        data = request.json
        try:
            new_item = Wishlist(
                user_id=data['user_id'], product_title=data['title'], price=data['price'],
                store=data['store'], product_url=data['url'], image_url=data['image']
            )
            db.session.add(new_item)
            db.session.commit()
            return jsonify({"status": "success"}), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 400
    
    u_id = request.args.get('user_id')
    items = db.session.query(Wishlist).filter_by(user_id=u_id).all()
    return jsonify({"wishlist": [{"title": i.product_title, "price": i.price, "store": i.store} for i in items]})

@app.route('/api/set-alert', methods=['POST'])
def set_alert():
    data = request.json
    try:
        new_alert = PriceAlert(
            product_name=data['product_name'], target_price=float(data['target_price']), user_email=data['user_email']
        )
        db.session.add(new_alert)
        db.session.commit()
        return jsonify({"status": "success", "message": "Alert registered"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)