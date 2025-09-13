import requests

def test_api_detailed():
    base_url = 'http://localhost:5000/api/properties'
    
    # Test different endpoints
    test_cases = [
        ('/', 'Basic endpoint'),
        ('?page=1&per_page=12', 'With pagination'),
        ('?university=wits', 'Filter by Wits'),
        ('?approved=true', 'Filter by approved'),
    ]
    
    for endpoint, description in test_cases:
        try:
            url = base_url + endpoint
            response = requests.get(url)
            print(f"\n{description}:")
            print(f"URL: {url}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Properties found: {len(data.get('properties', []))}")
                print(f"Total: {data.get('total', 0)}")
            else:
                print(f"Error response: {response.text}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == '__main__':
    test_api_detailed()
