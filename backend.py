import os
import asyncio
import uvicorn
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1. Load API Key from environment variable for security
API_KEY = os.environ.get("GEMINI_API_KEY")

app = FastAPI()

# 2. Configure CORS to allow requests from your React frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins to prevent CORS errors locally
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerationRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_test_cases(request: GenerationRequest):
    """Receives a prompt from the frontend and proxies it to the Gemini API."""
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # 1. Fetch available models directly from Google for this specific API key
            models_resp = await client.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}")
            models_resp.raise_for_status()
            
            # 2. Find all valid models that support text generation
            available_models = models_resp.json().get("models", [])
            supported_models = []
            
            for m in available_models:
                name = m.get("name", "")
                methods = m.get("supportedGenerationMethods", [])
                if "generateContent" in methods and "gemini" in name and "vision" not in name:
                    if "flash" in name: # Prefer flash models if available
                        supported_models.insert(0, name)
                    else:
                        supported_models.append(name)
            
            if not supported_models:
                raise HTTPException(status_code=500, detail="No supported Gemini models found for this API key.")

            # 3. Call models with automatic fallback on high demand
            last_error_detail = "Unknown error"
            last_status_code = 500
            
            for model_name in supported_models:
                print(f"🔄 Attempting generation with model: {model_name}...")
                gemini_api_url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": request.prompt}]}],
                    "generationConfig": {"temperature": 0.1, "maxOutputTokens": 8192}
                }
                
                try:
                    response = await client.post(gemini_api_url, json=payload)
                    response.raise_for_status() 
                    
                    gemini_data = response.json()
                    response_text = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    
                    if not response_text:
                        raise HTTPException(status_code=500, detail=f"Model {model_name} returned an empty response.")

                    return {"responseText": response_text}
                    
                except httpx.HTTPStatusError as e:
                    last_status_code = e.response.status_code
                    try:
                        error_json = e.response.json()
                        last_error_detail = error_json.get("error", {}).get("message", e.response.text)
                        error_details = error_json.get("error", {}).get("details", [])
                        if error_details:
                            last_error_detail += f" (Details: {error_details})"
                    except Exception:
                        last_error_detail = e.response.text
                        
                    if last_status_code in [400, 429, 503]:
                        print(f"⚠️ Model {model_name} failed ({last_status_code}: {last_error_detail}). Trying next model...")
                        await asyncio.sleep(1)
                        continue
                    else:
                        raise HTTPException(status_code=last_status_code, detail=f"Gemini API Error: {last_error_detail}")
            
            raise HTTPException(status_code=last_status_code, detail=f"All Gemini models are experiencing high demand. Please try again later. Last error: {last_error_detail}")
            
        except HTTPException:
            raise
        except httpx.HTTPStatusError as e:
            error_details = e.response.json().get("error", {}).get("message", e.response.text)
            raise HTTPException(status_code=e.response.status_code, detail=f"Gemini API Error: {error_details}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

if __name__ == "__main__":
    print("\n--- Starting Test Case Generator Backend ---")
    if not API_KEY:
        print("❌ FATAL: GEMINI_API_KEY environment variable not set. The server will not start.")
        print("👉 Please set it using: set GEMINI_API_KEY=your_key")
        exit(1)
    print(f"🔑 GEMINI_API_KEY loaded: {'Yes' if API_KEY else 'No'}")
    print("🚀 To test the server, open your browser to: http://127.0.0.1:8000/docs")
    print("------------------------------------------\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)