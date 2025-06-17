import requests

def test_properties_api():
    try:
        # Test the properties endpoint
        response = requests.get('http://localhost:5000/api/properties/')
        print(f"API Response Status: {response.status_code}")
        print(f"API Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Properties count: {len(data.get('properties', []))}")
        else:
            print("❌ API request failed")
            
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")

if __name__ == '__main__':
    test_properties_api()