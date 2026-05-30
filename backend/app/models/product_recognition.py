import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
import numpy as np

class ProductRecognizer:
    def __init__(self):
        self.model = MobileNetV2(weights='imagenet')

    def identify_product(self, preprocessed_image):
        """
        Takes a preprocessed image (numpy array 224x224x3) 
        and returns top predictions.
        """
        x = np.expand_dims(preprocessed_image, axis=0)
        x = preprocess_input(x * 255.0)  # Convert back to 0-255 then scale for model

        preds = self.model.predict(x)

        results = decode_predictions(preds, top=3)[0]
        
        formatted_results = []
        for _, label, score in results:
            formatted_results.append({
                "label": label.replace('_', ' '),
                "confidence": round(float(score) * 100, 2)
            })
            
        return formatted_results