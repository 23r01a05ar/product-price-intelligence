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

# Task 4 & 5 Imports
from preprocessing import preprocess_image
from model_integration import predict_product 

# Task 7 & 8 Imports
from product_search import get_amazon_prices, get_walmart_prices, get_flipkart_prices

# Task 9, 14, 5 & 6 Imports
from database import db, Product, Price, PriceAlert, User, SearchHistory, Wishlist
from crud import save_search_query, add_product_with_prices
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS

# Task 10 Import
from comparison_engine import compare_prices

app = Flask(__name__)
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
    # Updated to avoid .query conflict
    alerts = db.session.query(PriceAlert).filter_by(product_name=product_name, is_active=True).all()
    for alert in alerts:
        if current_lowest <= alert.target_price:
            print(f"!!! PRICE ALERT TRIGGERED for {alert.user_email} !!!")
            alert.is_active = False
            db.session.commit()

with app.app_context():
    db.create_all()
    print("Database initialized. Profile, Auth, Alert, History, and Wishlist systems active.")

# --- TASK 7: USER PROFILE ENDPOINTS ---

@app.route('/api/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
    
    return jsonify({
        "status": "success",
        "profile": {
            "username": user.username,
            "email": user.email,
            "bio": user.bio or "",
            "whatsapp_no": user.whatsapp_no or "",
            "twitter_handle": user.twitter_handle or "",
            "facebook_url": user.facebook_url or ""
        }
    }), 200

@app.route('/api/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.json
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    try:
        user.username = data.get('username', user.username)
        user.bio = data.get('bio', user.bio)
        user.whatsapp_no = data.get('whatsapp_no', user.whatsapp_no)
        user.twitter_handle = data.get('twitter_handle', user.twitter_handle)
        user.facebook_url = data.get('facebook_url', user.facebook_url)
        
        db.session.commit()
        return jsonify({"status": "success", "message": "Profile updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- TASK 4: GOOGLE AUTHENTICATION ENDPOINT ---

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
            user = User(
                username=username, 
                email=email, 
                password_hash="GOOGLE_AUTH_ACCOUNT"
            )
            db.session.add(user)
            db.session.commit()

        return jsonify({
            "status": "success",
            "user": {"id": user.id, "username": user.username, "email": user.email}
        }), 200
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid Google token"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- TASK 1: AUTHENTICATION ENDPOINTS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400
    if db.session.query(User).filter_by(email=email).first():
        return jsonify({"status": "error", "message": "Email already exists"}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"status": "success", "message": "User registered"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = db.session.query(User).filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            "status": "success", 
            "user": {"id": user.id, "username": user.username, "email": user.email}
        }), 200
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

# --- TASK 5: SEARCH HISTORY ENDPOINT ---

@app.route('/api/user-history/<int:user_id>', methods=['GET'])
def get_user_history(user_id):
    try:
        # Modern SQLAlchemy syntax used to avoid 'query' attribute conflict
        history = db.session.query(SearchHistory).filter_by(user_id=user_id)\
                    .order_by(SearchHistory.timestamp.desc())\
                    .limit(20).all()
        results = [{"query": h.query, "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M")} for h in history]
        return jsonify({"status": "success", "history": results}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- TASK 6: WISHLIST ENDPOINTS ---

@app.route('/api/wishlist', methods=['POST'])
def add_to_wishlist():
    data = request.json
    try:
        new_item = Wishlist(
            user_id=data['user_id'],
            product_title=data['title'],
            price=data['price'],
            store=data['store'],
            product_url=data['url'],
            image_url=data['image']
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"status": "success", "message": "Added to wishlist"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/wishlist/<int:user_id>', methods=['GET'])
def get_wishlist(user_id):
    try:
        items = db.session.query(Wishlist).filter_by(user_id=user_id).order_by(Wishlist.timestamp.desc()).all()
        results = [{
            "id": i.wish_id, "title": i.product_title, "price": i.price,
            "store": i.store, "url": i.product_url, "image": i.image_url,
            "date": i.timestamp.strftime("%Y-%m-%d")
        } for i in items]
        return jsonify({"status": "success", "wishlist": results}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/wishlist/<int:wish_id>', methods=['DELETE'])
def remove_from_wishlist(wish_id):
    try:
        item = db.session.get(Wishlist, wish_id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return jsonify({"status": "success", "message": "Removed from wishlist"}), 200
        return jsonify({"status": "error", "message": "Item not found"}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- API SEARCH ENDPOINTS ---

@app.route('/api/set-alert', methods=['POST'])
def set_alert():
    data = request.json
    try:
        new_alert = PriceAlert(
            product_name=data['product_name'],
            target_price=float(data['target_price']),
            user_email=data['user_email']
        )
        db.session.add(new_alert)
        db.session.commit()
        return jsonify({"status": "success", "message": "Alert registered"}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

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
        lowest = float(comparison['stats']['lowest'])
        run_price_alert_check(product_name, lowest)
    
    final_u_id = None
    if u_id and u_id not in [None, 'null', 'undefined', 'guest']:
        try:
            final_u_id = int(u_id)
        except ValueError:
            final_u_id = None
            
    save_search_query(user_id=final_u_id, query=product_name)
    add_product_with_prices(name=product_name, category="Search", image_url="", deals=all_deals)
    
    return jsonify({
        "status": "success", "product": product_name, "stats": comparison['stats'], "deals": comparison['ranked_deals']
    })

@app.route('/api/price-history', methods=['GET'])
def get_price_history():
    p_query = request.args.get('product_id')
    product = db.session.query(Product).filter((Product.product_id == p_query) | (Product.name == p_query)).first()
    if not product:
        return jsonify({"history": []})
    history_records = db.session.query(Price).filter_by(product_id=product.product_id).order_by(Price.timestamp.desc()).all()
    results = [{"price": h.price, "store": h.store_name, "date": h.timestamp.strftime("%Y-%m-%d %H:%M")} for h in history_records]
    return jsonify({"history": results})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    u_id = request.form.get('user_id')
    file = request.files['image']
    
    if file and ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS):
        unique_id = str(uuid.uuid4())[:8]
        filename = secure_filename(f"{unique_id}.{file.filename.rsplit('.', 1)[1].lower()}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(filepath)
            preprocess_image(filepath)
            prediction = predict_product(filepath)
            product_name = prediction['label']
            
            amazon = get_amazon_prices(product_name)
            walmart = get_walmart_prices(product_name)
            flipkart = get_flipkart_prices(product_name)
            all_deals = amazon + walmart + flipkart
            comparison = compare_prices(all_deals)
            
            if comparison['ranked_deals']:
                lowest_price = float(comparison['stats']['lowest'])
                run_price_alert_check(product_name, lowest_price)
            
            image_url = f"http://127.0.0.1:5000/uploads/{filename}"
            
            final_u_id = None
            if u_id and u_id not in [None, 'null', 'undefined', 'guest']:
                try:
                    final_u_id = int(u_id)
                except ValueError:
                    final_u_id = None

            save_search_query(user_id=final_u_id, query=product_name)
            add_product_with_prices(name=product_name, category="AI", image_url=image_url, deals=all_deals)
            
            return jsonify({
                "status": "success", 
                "prediction": product_name, 
                "confidence": prediction['confidence'],
                "stats": comparison['stats'], 
                "best_deal": comparison['ranked_deals'][0] if comparison['ranked_deals'] else None,
                "deals": {"amazon": [d for d in comparison['ranked_deals'] if d['store'] == 'Amazon']}
            }), 201
            
        except Exception as e:
            traceback.print_exc()
            return jsonify({"status": "error", "message": "Processing failed", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)