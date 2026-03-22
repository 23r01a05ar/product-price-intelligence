import os
import numpy as np
import cv2
from PIL import Image
from preprocessing.image_preprocessing import ImagePreprocessor

def test_preprocess_various_formats(tmp_path):
    preprocessor = ImagePreprocessor()
    
    png_path = os.path.join(tmp_path, "test_image.png")
    dummy_data = np.zeros((100, 100, 3), dtype=np.uint8)
    Image.fromarray(dummy_data).save(png_path)

    processed = preprocessor.preprocess(png_path)
    
    assert processed.shape == (224, 224, 3), "Should resize and maintain 3 channels"
    assert processed.max() <= 1.0, "Should be normalized between 0 and 1"
    assert processed.dtype == np.float32 or processed.dtype == np.float64, "Should be float after normalization"

def test_enhancement_logic():
    preprocessor = ImagePreprocessor()
    test_img = np.ones((100, 100, 3), dtype=np.uint8) * 50 # Dark image
    
    enhanced = preprocessor.enhance_image(test_img, alpha=2.0, beta=50)
    
    assert not np.array_equal(test_img, enhanced), "Enhancement should modify the image"
    assert enhanced[0,0,0] > test_img[0,0,0], "Brightness/Contrast should increase pixel values"

def test_full_pipeline_requirements():
    preprocessor = ImagePreprocessor()
    test_image_path = "tests/sample.jpg" 
    
    processed = preprocessor.preprocess(test_image_path)
    assert processed.shape == (224, 224, 3)  
    assert processed.max() <= 1.0            
    assert processed.min() >= 0.0            