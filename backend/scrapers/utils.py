import random
import time
from fake_useragent import UserAgent

def get_headers():
    ua = UserAgent()
    return {
        "User-Agent": ua.random,
        "Accept-Language": "en-US,en;q=0.9"
    }

def throttle(min_delay=2, max_delay=5):
    time.sleep(random.uniform(min_delay, max_delay))