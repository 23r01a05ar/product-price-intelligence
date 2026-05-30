from database import db, Product, Price, SearchHistory

def save_search_query(user_id, query):
    """Saves the search query. Handles guests and logged-in users."""
    try:
        # Convert frontend string markers to actual Python None for the database
        if user_id in ["guest", "null", "undefined", "api_user", "default_user"]:
            user_id = None
        
        new_search = SearchHistory(user_id=user_id, query=query)
        db.session.add(new_search)
        db.session.commit()
        return new_search
    except Exception as e:
        db.session.rollback()
        print(f"Error in save_search_query: {e}")
        return None

def add_product_with_prices(name, category, image_url, deals):
    """Saves product info and the latest scraped prices."""
    try:
        # 1. Create or Update Product
        product = Product.query.filter_by(name=name).first()
        if not product:
            product = Product(name=name, category=category, image_url=image_url)
            db.session.add(product)
            db.session.commit()

        # 2. Add Prices (Create)
        for deal in deals:
            # Fallback for price: try numeric_price first, otherwise clean the 'price' string
            price_val = deal.get('numeric_price')
            if price_val is None:
                try:
                    price_val = float(str(deal['price']).replace('$', '').replace(',', ''))
                except:
                    price_val = 0.0

            new_price = Price(
                product_id=product.product_id,
                store_name=deal['store'],
                price=price_val,
                product_url=deal['url']
            )
            db.session.add(new_price)
        
        db.session.commit()
        return product
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_product_with_prices: {e}")
        return None

def get_search_history(user_id):
    """Retrieves history for a specific user ID."""
    return SearchHistory.query.filter_by(user_id=user_id).order_by(SearchHistory.timestamp.desc()).all()