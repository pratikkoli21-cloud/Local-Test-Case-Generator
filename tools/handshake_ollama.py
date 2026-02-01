import requests
import json

def check_ollama():
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": "Hello, are you working?",
        "stream": False
    }
    
    try:
        print(f"Testing connection to {url} with model 'llama3.2'...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            print("✅ Success! Ollama is responding.")
            print("Response:", response.json().get("response"))
        else:
            print(f"❌ Error: Received status code {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Is Ollama running on localhost:11434?")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    check_ollama()
