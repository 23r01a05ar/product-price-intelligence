import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from db_models import get_db_session, get_or_create_product, init_db, record_search_and_prices, User, Wishlist
from werkzeug.security import generate_password_hash, check_password_hash
from price_compare import compare_prices
from image_recognition import detect_product


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD = os.path.join(
    BASE_DIR,
    "..",
    "frontend",
    "frontend-app",
    "build",
)


app = Flask(__name__, static_folder=FRONTEND_BUILD, static_url_path="/")
app.config["SECRET_KEY"] = "dev-secret-key-change-me"
CORS(app)


@app.route("/upload-image", methods=["POST"])
def upload_image():
    """
    End-to-end pipeline:
    - Receive uploaded image
    - Run product recognition
    - Fetch best prices from multiple sources
    - Persist search + prices in the database
    """
    try:
        file = request.files.get("file")
        if file is None:
            return jsonify({"error": "No file received"}), 400

        temp_path = "temp_image.jpg"
        file.save(temp_path)

        product_name = detect_product(temp_path)
        print("Product:", product_name)

        if not product_name:
            return jsonify({"product": "Unknown product", "results": []}), 200

        offers = compare_prices(product_name)

        user_email = (request.headers.get("X-User-Email") or "").strip().lower()

        with get_db_session() as db:
            product = get_or_create_product(db, product_name)
            user = db.query(User).filter(User.email == user_email).first() if user_email else None
            user_id_value = str(user.id) if user else None
            record_search_and_prices(db, product, product_name, offers, user_id=user_id_value)

        return jsonify({"product": product_name, "results": offers}), 200

    except Exception as e:
        print("BACKEND ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/compare-prices", methods=["GET"])
def api_compare_prices():
    """
    Compare prices directly from a product name without image upload.
    """
    product_name = request.args.get("product")
    if not product_name:
        return jsonify({"error": "Missing 'product' query parameter"}), 400

    try:
        offers = compare_prices(product_name)

        user_email = (request.headers.get("X-User-Email") or "").strip().lower()

        with get_db_session() as db:
            product = get_or_create_product(db, product_name)
            user = db.query(User).filter(User.email == user_email).first() if user_email else None
            user_id_value = str(user.id) if user else None
            record_search_and_prices(db, product, product_name, offers, user_id=user_id_value)

        return jsonify({"product": product_name, "results": offers}), 200
    except Exception as e:
        print("COMPARE API ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/price-history", methods=["GET"])
def api_price_history():
    """
    Return historical price data for a given product_id.
    """
    from db_models import Price, Product

    product_id = request.args.get("product_id")
    if not product_id:
        return jsonify({"error": "Missing 'product_id' query parameter"}), 400

    try:
        with get_db_session() as db:
            product = db.query(Product).filter(Product.id == int(product_id)).first()
            if not product:
                return jsonify({"error": "Product not found"}), 404

            prices = (
                db.query(Price)
                .filter(Price.product_id == product.id)
                .order_by(Price.created_at.asc())
                .all()
            )

            history = [
                {
                    "store_name": p.store_name,
                    "price": p.price,
                    "currency": p.currency,
                    "timestamp": p.created_at.isoformat(),
                    "raw_price_text": p.raw_price_text,
                }
                for p in prices
            ]

        return jsonify({"product": product.name, "history": history}), 200
    except Exception as e:
        print("PRICE HISTORY ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/register", methods=["POST"])
def register():
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    name = (payload.get("name") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    with get_db_session() as db:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return jsonify({"error": "User already exists"}), 409

        user = User(
            email=email,
            name=name,
            password_hash=generate_password_hash(password),
        )
        db.add(user)
        db.commit()

        return jsonify({"email": user.email, "name": user.name}), 201


@app.route("/api/login", methods=["POST"])
def login():
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    with get_db_session() as db:
        user = db.query(User).filter(User.email == email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({"email": user.email, "name": user.name}), 200


@app.route("/api/search-history", methods=["GET"])
def search_history():
    email = (request.args.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Missing 'email' query parameter"}), 400

    from db_models import SearchHistory, Product

    with get_db_session() as db:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return jsonify({"history": []}), 200

        history_rows = (
            db.query(SearchHistory, Product)
            .join(Product, Product.id == SearchHistory.product_id)
            .filter(SearchHistory.user_id == str(user.id))
            .order_by(SearchHistory.created_at.desc())
            .limit(20)
            .all()
        )

        history = [
            {
                "query": row.SearchHistory.query,
                "product_name": row.Product.name,
                "timestamp": row.SearchHistory.created_at.isoformat(),
            }
            for row in history_rows
        ]

    return jsonify({"history": history}), 200


@app.route("/api/wishlist", methods=["GET", "POST"])
def wishlist():
    if request.method == "GET":
        email = (request.args.get("email") or "").strip().lower()
        if not email:
            return jsonify({"error": "Missing 'email' query parameter"}), 400

        with get_db_session() as db:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                return jsonify({"wishlist": []}), 200

            items = (
                db.query(Wishlist)
                .filter(Wishlist.user_id == user.id)
                .order_by(Wishlist.created_at.desc())
                .all()
            )

            wishlist_data = [
                {
                    "product_name": item.product_name,
                    "store_name": item.store_name,
                    "price": item.price,
                    "url": item.url,
                    "timestamp": item.created_at.isoformat(),
                }
                for item in items
            ]

        return jsonify({"wishlist": wishlist_data}), 200

    # POST
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    product_name = (payload.get("product_name") or "").strip()
    store_name = (payload.get("store_name") or "").strip()
    url = (payload.get("url") or "").strip()
    price = payload.get("price")

    if not product_name or not store_name or not url:
        return jsonify({"error": "product_name, store_name and url are required"}), 400

    from db_models import parse_price_to_float

    with get_db_session() as db:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        numeric_price = parse_price_to_float(price)
        item = Wishlist(
            user_id=user.id,
            product_name=product_name,
            store_name=store_name,
            url=url,
            price=numeric_price,
        )
        db.add(item)
        db.commit()

    return jsonify({"status": "ok"}), 201


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """
    Serve the built React frontend from the Flask server.
    """
    if os.path.exists(os.path.join(FRONTEND_BUILD, path)) and path != "":
        return send_from_directory(FRONTEND_BUILD, path)
    return send_from_directory(FRONTEND_BUILD, "index.html")


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
