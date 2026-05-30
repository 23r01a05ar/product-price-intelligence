import requests

url = "https://api.upcitemdb.com/prod/trial/lookup"

params = {
    "upc": "012993441012"  # sample UPC
}

response = requests.get(url, params=params)

print("Status:", response.status_code)
print("Response:", response.json())