import requests
import re
from config import AMAZON_KEY, AMAZON_HOST, WALMART_KEY, WALMART_HOST, FLIPKART_KEY, FLIPKART_HOST

def clean_price(price_str):
    """
    Helper to convert '$49.99' or 'Rs. 4,000' into a float 49.99 for sorting.
    """
    if not price_str or price_str == "Check Site":
        return 0.0
    # Remove currency symbols and commas, keep digits and dots
    cleaned = re.sub(r'[^\d.]', '', str(price_str))
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def get_amazon_prices(query):
    url = f"https://{AMAZON_HOST}/search"
    headers = {"x-rapidapi-key": AMAZON_KEY, "x-rapidapi-host": AMAZON_HOST}
    querystring = {"query": query, "page": "1", "country": "US"}
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()
        products = []
        for item in data.get("data", {}).get("products", []):
            raw_price = item.get("product_price", "Check Site")
            products.append({
                "store": "Amazon",
                "title": item.get("product_title"),
                "price": raw_price,
                "numeric_price": clean_price(raw_price), # New field for sorting
                "url": item.get("product_url"),
                "image": item.get("product_photo")
            })
        return products[:3]
    except:
        return []

def get_walmart_prices(query):
    url = f"https://{WALMART_HOST}/search"
    headers = {"x-rapidapi-key": WALMART_KEY, "x-rapidapi-host": WALMART_HOST}
    querystring = {"q": query}
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()
        products = []
        results = data.get("data", []) or data.get("items", []) or data.get("products", [])
        
        for item in results:
            raw_price = item.get("price", {}).get("current_price") or item.get("product_price") or "Check Site"
            products.append({
                "store": "Walmart",
                "title": item.get("name") or item.get("title") or item.get("product_title"),
                "price": raw_price,
                "numeric_price": clean_price(raw_price), # New field for sorting
                "url": item.get("url") or item.get("product_url"),
                "image": item.get("image") or item.get("product_photo")
            })
        return products[:3]
    except:
        return []

def get_flipkart_prices(query):
    url = f"https://{FLIPKART_HOST}/search"
    headers = {"x-rapidapi-key": FLIPKART_KEY, "x-rapidapi-host": FLIPKART_HOST}
    querystring = {"q": query}
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()
        products = []
        results = data.get("products", []) or data.get("data", {}).get("products", [])
        
        for item in results:
            raw_price = item.get("product_price") or item.get("price") or "Check Site"
            products.append({
                "store": "Flipkart",
                "title": item.get("product_title") or item.get("title"),
                "price": raw_price,
                "numeric_price": clean_price(raw_price), # New field for sorting
                "url": item.get("product_url") or item.get("url"),
                "image": item.get("product_photo") or item.get("image")
            })
        return products[:3]
    except:
        return []