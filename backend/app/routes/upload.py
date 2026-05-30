import os
import uuid

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
upload_bp = Blueprint("upload", __name__)
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def allowed_file(filename):

    return "." in filename and \
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS



@upload_bp.route("/upload-image", methods=["POST"])

def upload_image():

    try:

        # Check file exists

        if "file" not in request.files:

            return jsonify({

                "status": "error",

                "message": "No file provided"

            }), 400



        file = request.files["file"]



        if file.filename == "":

            return jsonify({

                "status": "error",

                "message": "No file selected"

            }), 400



        if not allowed_file(file.filename):

            return jsonify({

                "status": "error",

                "message": "Invalid format. Only JPEG, PNG, WebP allowed"

            }), 415



        image_id = str(uuid.uuid4())

        filename = secure_filename(file.filename)

        unique_filename = f"{image_id}_{filename}"



        filepath = os.path.join(

            current_app.config["UPLOAD_FOLDER"],

            unique_filename

        )

        file.save(filepath)

        return jsonify({

            "status": "success",

            "image_id": image_id,

            "filename": unique_filename

        }), 201



    except Exception as e:

        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500