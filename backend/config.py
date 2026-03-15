import os



# Amazon API Configuration
AMAZON_KEY = "fb2b92412cmsh8e4041d5e17a96fp190184jsn15f3f7612335"
AMAZON_HOST = "real-time-amazon-data.p.rapidapi.com"

# Walmart Configuration
WALMART_KEY = "fb2b92412cmsh8e4041d5e17a96fp190184jsn15f3f7612335"
WALMART_HOST = "real-time-walmart-product-data-api.p.rapidapi.com"

# Flipkart Configuration
FLIPKART_KEY = "Yfb2b92412cmsh8e4041d5e17a96fp190184jsn15f3f7612335"
FLIPKART_HOST = "real-time-flipkart-data2.p.rapidapi.com"

# Database Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'price_intelligence.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False