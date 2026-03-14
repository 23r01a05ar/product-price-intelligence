from dotenv import load_dotenv
import os
import requests
import base64

load_dotenv()

CLIENT_ID = os.getenv("EBAY_CLIENT_ID")
CLIENT_SECRET = os.getenv("EBAY_CLIENT_SECRET")

def ebay_search(product_name):
    # ---- AUTH TOKEN ----
    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }

    data = {
        "grant_type": "client_credentials",
        "scope": "https://api.ebay.com/oauth/api_scope"
    }

    token_response = requests.post(
        "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
        headers=headers,
        data=data
    )

    access_token = token_response.json().get("access_token")

    if not access_token:
        print("Failed to get eBay token")
        return []

    # ---- PRODUCT SEARCH ----
    search_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    search_url = f"https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q={product_name}"

    search_response = requests.get(search_url, headers=search_headers)

    results = []
    items = search_response.json().get("itemSummaries", [])

    for item in items[:5]:
        results.append({
                  "source": "eBay",
                   "title": item.get("title"),
                   "price": item.get("price", {}).get("value"),
                   "link": item.get("itemWebUrl")
        })

    return results
