import time
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

HEADERS = {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def scrape_amazon(keyword):
    results = []

    # -------------------------
    # 1️⃣ TRY SELENIUM FIRST
    # -------------------------
    try:
        options = Options()
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--start-maximized")

        driver = webdriver.Chrome(options=options)
        driver.get(f"https://www.amazon.com/s?k={keyword}")
        time.sleep(6)

        products = driver.find_elements(By.CSS_SELECTOR, "div.s-result-item")

        for p in products:
            try:
                title = p.find_element(By.TAG_NAME, "h2").text
                link = p.find_element(By.TAG_NAME, "a").get_attribute("href")

                if title and link:
                    results.append({
                        "platform": "Amazon",
                        "product_name": title,
                        "price": "Check listing",
                        "availability": "Check listing",
                        "product_url": link,
                        "seller_rating": "N/A",
                        "shipping": "Check listing"
                    })

                if len(results) == 5:
                    break
            except:
                continue

        driver.quit()

    except Exception as e:
        print("Amazon Selenium failed:", e)

    
    if results:
        return results

    
    # 2️⃣ FALLBACK → REQUESTS
    
    print("Amazon Selenium blocked → using HTML fallback")

    try:
        url = f"https://www.amazon.com/s?k={keyword}"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, "lxml")

        items = soup.select('div[data-component-type="s-search-result"] h2 a')

        for item in items:
            title = item.text.strip()
            href  = item.get('href')

            if not title or not href:
                continue

            link = "https://www.amazon.com" + href

            results.append({
                "platform": "Amazon",
                "product_name": title,
                "price": "Check listing",
                "availability": "Check listing",
                "product_url": link,
                "seller_rating": "N/A",
                "shipping": "Check listing"
            })

            if len(results) == 5:
                break

    except Exception as e:
        print("Amazon fallback failed:", e)

    return results