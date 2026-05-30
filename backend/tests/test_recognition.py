import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing.image_preprocessing import ImagePreprocessor
from app.models.product_recognition import ProductRecognizer 

def run_test():
    print("🚀 Initializing Task 5: Recognition Engine...")
    image_path = os.path.join(os.path.dirname(__file__), "sample.jpg")
    if not os.path.exists(image_path):
        print(f"❌ Error: {image_path} not found in tests folder!")
        return
    preprocessor = ImagePreprocessor()
    recognizer = ProductRecognizer()
    print("⚙️  Preprocessing image...")
    processed_img = preprocessor.preprocess(image_path)
    print("🧠 Identifying product via MobileNetV2...")
    predictions = recognizer.identify_product(processed_img)
    print("\n✅ SUCCESS! Identification results:")
    for res in predictions:
        print(f"- {res['label']}: {res['confidence']}%")

if __name__ == "__main__":
    run_test()