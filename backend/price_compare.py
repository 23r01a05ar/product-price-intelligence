from serpapi_fetch import search_product
from ebay_test import ebay_search
from scrapers.amazon_scraper import scrape_amazon
from scrapers.ebay_scraper import scrape_ebay
from scrapers.walmart_scraper import scrape_walmart
from db_models import parse_price_to_float


def compare_prices(product_name: str) -> list[dict]:
    """
    Aggregate price and product offers from multiple sources for a given product.
    Returns a normalized, sorted list with the best (lowest) price flagged.
    """
    query = product_name.strip()
    raw_results: list[dict] = []

    # SERPAPI (Google Shopping style meta source)
    try:
        serp_results = search_product(query)
        for item in serp_results:
            raw_results.append(
                {
                    "platform": "SerpAPI",
                    "product_name": item.get("title"),
                    "price": item.get("price"),
                    "availability": "Check listing",
                    "product_url": item.get("link"),
                    "seller_rating": "N/A",
                    "shipping": "Check listing",
                }
            )
    except Exception as exc:
        print("SerpAPI error:", exc)

    # eBay official API (sandbox)
    try:
        ebay_api_results = ebay_search(query)
        for item in ebay_api_results:
            raw_results.append(
                {
                    "platform": "eBay API",
                    "product_name": item.get("title"),
                    "price": item.get("price"),
                    "availability": "Check listing",
                    "product_url": item.get("link"),
                    "seller_rating": "N/A",
                    "shipping": "Check listing",
                }
            )
    except Exception as exc:
        print("eBay API error:", exc)

    # HTML scrapers (Amazon, eBay, Walmart)
    try:
        raw_results.extend(scrape_amazon(query))
    except Exception as exc:
        print("Amazon scraper error:", exc)

    try:
        raw_results.extend(scrape_ebay(query))
    except Exception as exc:
        print("Ebay scraper error:", exc)

    try:
        raw_results.extend(scrape_walmart(query))
    except Exception as exc:
        print("Walmart scraper error:", exc)

    # Post-process: compute numeric prices, filter unusable entries, and sort
    processed: list[dict] = []
    for offer in raw_results:
        url = offer.get("product_url") or offer.get("link")
        if not url:
            # Skip offers where we cannot send user to a real listing
            continue
        numeric_price = parse_price_to_float(offer.get("price"))
        offer_copy = dict(offer)
        offer_copy["numeric_price"] = numeric_price
        processed.append(offer_copy)

    # Sort: offers with numeric price first (ascending), then those without
    processed.sort(
        key=lambda x: (x["numeric_price"] is None, x["numeric_price"] or 0.0)
    )

    # Flag best (lowest) price
    best_flagged: list[dict] = []
    for idx, offer in enumerate(processed):
        offer_copy = dict(offer)
        offer_copy["is_best"] = idx == 0 and offer_copy["numeric_price"] is not None
        best_flagged.append(offer_copy)

    return best_flagged
