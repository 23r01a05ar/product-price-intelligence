import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import numpy as np
from PIL import Image

# 1. Load the pre-trained MobileNetV2 model once when the script starts
# This downloads the ImageNet weights (approx. 14MB) on first run
print("Loading MobileNetV2 model...")
model = MobileNetV2(weights='imagenet')

def predict_product(image_path):
    """
    Identifies the product in the image using MobileNetV2.
    """
    try:
        # Load and resize specifically for MobileNetV2 (224x224 pixels)
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        
        # Convert image to numpy array
        x = np.array(img)
        
        # Corrected: Add batch dimension (1, 224, 224, 3)
        # MobileNetV2 expects a 4D tensor as input
        x = np.expand_dims(x, axis=0)
        
        # Standard MobileNet preprocessing (scales pixel values to [-1, 1])
        x = preprocess_input(x)
        
        # Perform Prediction
        preds = model.predict(x)
        
        # Decode the top result
        # decode_predictions returns a list: [(id, label, probability)]
        results = decode_predictions(preds, top=1)[0][0]
        
        # Format the label (e.g., "notebook_computer" -> "Notebook Computer")
        label = results[1].replace('_', ' ').title()
        confidence = float(results[2])
        
        return {
            "label": label,
            "confidence": f"{confidence * 100:.2f}%"
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        return {"label": "Unknown Object", "confidence": "0%"}

# Optional: Add a local test to verify the file works independently
if __name__ == "__main__":
    # If you have a test image, replace 'test.jpg' to run: python model_integration.py
    print("Model ready for inference.")