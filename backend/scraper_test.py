from scrapers.ebay_scraper import scrape_ebay
from scrapers.amazon_scraper import scrape_amazon
from scrapers.walmart_scraper import scrape_walmart

keyword = "laptop"

print("EBAY:", scrape_ebay(keyword))
print("AMAZON:", scrape_amazon(keyword))
print("WALMART:", scrape_walmart(keyword))