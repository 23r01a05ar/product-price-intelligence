from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Task 1, 4 & 7: User Model (Updated for Profiles & Social Links)
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True) 
    google_id = db.Column(db.String(150), unique=True, nullable=True)
    
    # Task 7: Profile Details
    bio = db.Column(db.String(500), nullable=True)
    whatsapp_no = db.Column(db.String(20), nullable=True)
    twitter_handle = db.Column(db.String(100), nullable=True)
    facebook_url = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    searches = db.relationship('SearchHistory', backref='user', lazy=True)
    alerts = db.relationship('PriceAlert', backref='user', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='user', lazy=True)

class Product(db.Model):
    __tablename__ = 'products'
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, index=True) 
    category = db.Column(db.String(100))
    image_url = db.Column(db.Text)
    prices = db.relationship('Price', backref='product', lazy=True, cascade="all, delete-orphan")

class Price(db.Model):
    __tablename__ = 'prices'
    price_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    store_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    product_url = db.Column(db.Text)

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    search_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) 
    query = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class PriceAlert(db.Model):
    __tablename__ = 'price_alerts'
    alert_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    product_name = db.Column(db.String(255), nullable=False)
    target_price = db.Column(db.Float, nullable=False)
    user_email = db.Column(db.String(120), nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Wishlist(db.Model):
    __tablename__ = 'wishlist'
    wish_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_title = db.Column(db.String(255), nullable=False)
    price = db.Column(db.String(50))
    store = db.Column(db.String(100))
    product_url = db.Column(db.Text)
    image_url = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)