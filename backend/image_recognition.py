import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image

# Load MobileNet model
model = MobileNetV2(weights="imagenet")

def detect_product(img_path):
    # Load and resize image
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)

    # Expand dimensions
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    # Predict
    preds = model.predict(img_array)

    # Decode prediction
    decoded = decode_predictions(preds, top=1)[0][0]

    # Human-friendly label, underscores replaced with spaces
    product_name = decoded[1].replace("_", " ").strip()

    return product_name