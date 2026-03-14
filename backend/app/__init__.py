from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)

    app.config["UPLOAD_FOLDER"] = "app/uploads"
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    CORS(app)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    from app.routes.upload import upload_bp
    app.register_blueprint(upload_bp, url_prefix="/api")

    @app.errorhandler(413)
    def too_large(e):
        return {
            "status": "error",
            "message": "File size exceeds 10MB limit"
        }, 413


    return app
