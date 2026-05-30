import requests
from bs4 import BeautifulSoup
from .utils import get_headers, throttle

def scrape_walmart(keyword):
    throttle()
    url = f"https://www.walmart.com/search?q={keyword}"
    response = requests.get(url, headers=get_headers())

    soup = BeautifulSoup(response.text, "lxml")
    results = []

    products = soup.select("div[data-item-id]")[:5]

    for product in products:
        try:
            results.append({
                "platform": "Walmart",
                "product_name": product.select_one("a span").text,
                "price": "Check listing",
                "availability": "Check listing",
                "product_url": "https://www.walmart.com",
                "seller_rating": "N/A",
                "shipping": "Check listing"
            })
        except:
            continue

    return results