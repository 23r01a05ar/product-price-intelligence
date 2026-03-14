import cv2
import numpy as np
from PIL import Image


class ImagePreprocessor:

    def __init__(self, target_size=(224, 224)):
        self.target_size = target_size
    def convert_to_rgb(self, image_path):
        img = Image.open(image_path).convert("RGB")
        return np.array(img)
    def resize_image(self, image):
        resized = cv2.resize(image, self.target_size)
        return resized
    def reduce_noise(self, image):
        blurred = cv2.GaussianBlur(image, (5, 5), 0)
        return blurred
    def normalize_image(self, image):
        normalized = image.astype("float32") / 255.0
        return normalized
    def enhance_image(self, image, alpha=1.2, beta=20):
        enhanced = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
        return enhanced
    def preprocess(self, image_path):
        image = self.convert_to_rgb(image_path)
        image = self.resize_image(image)
        image = self.reduce_noise(image)
        image = self.enhance_image(image)
        image = self.normalize_image(image)
        return image
    def enhance_image(self, image, alpha=1.2, beta=10):
        adjusted = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
        return adjusted
    def preprocess(self, image_path):
        img = self.convert_to_rgb(image_path)
        img = self.resize_image(img)
        img = self.enhance_image(img) # New
        img = self.reduce_noise(img)
        img = self.normalize_image(img)
        return img