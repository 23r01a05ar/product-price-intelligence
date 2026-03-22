import requests

API_KEY = "44c501bef36f4414e347944032f8d0c131bfe7c24fb5f7ec8883a4942e6a8183"

def search_product(product_name):
    url = "https://serpapi.com/search.json"
    
    params = {
        "q": product_name,
        "tbm": "shop",
        "api_key": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []
    for item in data.get("shopping_results", []):
        results.append({
            "source": "SerpAPI",
            "title": item.get("title"),
            "price": item.get("price"),
            "link": item.get("link")
        })

    return results


if __name__ == "__main__":
    products = search_product("laptop")

    for p in products[:5]:
        print(p)