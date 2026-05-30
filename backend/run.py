from serpapi_fetch import search_product
from ebay_test import ebay_search

def run_all_apis(product_price):
    results = []

    print("Running SerpAPI...")
    serpapi_results = search_product(product_name)

    print("Running eBay API...")
    ebay_results = ebay_search(product_name)

    results.extend(serpapi_results)
    results.extend(ebay_results)

    return results


if __name__ == "__main__":
    product = input("Enter product name: ")

    all_results = run_all_apis(product)

    print("\n===== FINAL COMBINED RESULTS =====\n")
    for item in all_results:
        print(f"Source : {item['source']}")
        print(f"Title  : {item['title']}")
        print(f"Price  : {item['price']}")
        print(f"Link   : {item['link']}")
        print("-----------------------------")

