import statistics
import re

def normalize_name(name):
    """
    Normalizes product names by removing special characters and extra spaces 
    to help in matching variations.
    """
    if not name: return ""
    return re.sub(r'[^a-zA-Z0-9\s]', '', name).lower().strip()

def calculate_deal_score(deal):
    """
    Implements a scoring system considering price and platform reputation.
    Higher scores are better (Scale 1-100).
    """
    # Base score is 100, we subtract for higher prices
    price = deal.get('numeric_price', 0)
    if price == 0: return 0
    
    # Simple weighted logic: Lower price is 70% of score, 
    # Store reputation (mocked for now) is 30%.
    score = 100 - (price * 0.01) # Price impact
    
    # Store reputation weight 
    reputation_bonus = {"Amazon": 30, "Walmart": 25, "Flipkart": 25}
    score += reputation_bonus.get(deal['store'], 20)
    
    return round(min(max(score, 0), 100), 2)

def compare_prices(all_deals):
    """
    Aggregates prices, calculates statistics, and returns structured results.
    """
    valid_deals = [d for d in all_deals if d.get('numeric_price', 0) > 0]
    
    if not valid_deals:
        return {
            "stats": {"lowest": 0, "highest": 0, "average": 0},
            "ranked_deals": []
        }

    prices = [d['numeric_price'] for d in valid_deals]
    
    # Calculate statistics 
    stats = {
        "lowest": min(prices),
        "highest": max(prices),
        "average": round(statistics.mean(prices), 2),
        "total_count": len(valid_deals)
    }

    # Process and rank each deal 
    processed_deals = []
    for deal in valid_deals:
        # Account for additional costs (mocked tax/shipping at 5%) 
        final_price = deal['numeric_price'] * 1.05 
        
        processed_deals.append({
            **deal,
            "final_estimated_price": round(final_price, 2),
            "deal_score": calculate_deal_score(deal),
            "normalized_title": normalize_name(deal['title'])
        })

    # Sort by deal score descending 
    ranked_deals = sorted(processed_deals, key=lambda x: x['deal_score'], reverse=True)

    return {
        "stats": stats,
        "ranked_deals": ranked_deals
    }