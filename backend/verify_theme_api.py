import requests
import json

BASE_URL = "http://localhost:8000"

def test_theme_api():
    try:
        # 1. Get active theme CSS
        print("Checking active theme CSS...")
        resp = requests.get(f"{BASE_URL}/settings/theme/active")
        if resp.status_code == 200:
            print("Active theme CSS retrieved successfully.")
            # print(json.dumps(resp.json(), indent=2))
        else:
            print(f"Failed to get active theme CSS: {resp.status_code}")

        # 2. List themes (needs admin login, but let's see if we can at least reach it)
        # For now, I'll just check if the endpoint exists and returns 401/403 if not authenticated
        print("\nChecking themes list endpoint...")
        resp = requests.get(f"{BASE_URL}/settings/theme")
        if resp.status_code in [200, 401, 403]:
            print(f"Themes list endpoint reached (Status: {resp.status_code})")
        else:
            print(f"Unexpected status for themes list: {resp.status_code}")

    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    test_theme_api()
