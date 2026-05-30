import requests
from bs4 import BeautifulSoup
from .utils import get_headers, throttle

def scrape_ebay(keyword):
    throttle()
    url = f"https://www.ebay.com/sch/i.html?_nkw={keyword}"
    response = requests.get(url, headers=get_headers())

    soup = BeautifulSoup(response.text, "lxml")
    results = []

    items = soup.select(".s-item")[:5]

    for item in items:
        try:
            results.append({
                "platform": "eBay",
                "product_name": item.select_one(".s-item__title").text,
                "price": item.select_one(".s-item__price").text,
                "availability": "Check listing",
                "product_url": item.select_one(".s-item__link")["href"],
                "seller_rating": "N/A",
                "shipping": "Check listing"
            })
        except:
            continue

    return results