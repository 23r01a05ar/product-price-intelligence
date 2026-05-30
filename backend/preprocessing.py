import cv2
import numpy as np
from PIL import Image

def load_image(image_path):
    """Load image from disk and convert it to RGB format """
    img = Image.open(image_path)
    img = img.convert("RGB")
    return np.array(img)

def resize_image(image, size=(224, 224)):
    """Resize image to standard CNN input size """
    return cv2.resize(image, size)

def noise_reduction(image, method="gaussian"): 
    """Reduce noise using Gaussian Filtering (5x5 kernel) """
    if method == "gaussian":
        return cv2.GaussianBlur(image, (5, 5), 0)
    elif method == "median":
        return cv2.medianBlur(image, 5)
    return image
    
def enhance_image(image, brightness=30, contrast=1.2):
    """Enhance image brightness and contrast using linear transform """
    return cv2.convertScaleAbs(image, alpha=contrast, beta=brightness)

def normalize_image(image):
    """Normalize pixel values to range [0, 1] for the model """
    return image.astype(np.float32) / 255.0

def preprocess_image(image_path, size=(224, 224)):
    """Complete image preprocessing pipeline """
    image = load_image(image_path)
    image = resize_image(image, size)
    image = noise_reduction(image, method="gaussian")
    image = enhance_image(image)
    image = normalize_image(image)
    return image