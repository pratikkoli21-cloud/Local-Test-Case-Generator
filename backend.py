import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS so the React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.post("/generate")
async def generate_test_cases(request: PromptRequest):
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is not set. Please check your .env file.")

        async with httpx.AsyncClient(timeout=600.0) as client:
            # 1. Ask Google exactly which models your API key has access to
            list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            list_resp = await client.get(list_url)
            
            if list_resp.status_code != 200:
                raise HTTPException(status_code=list_resp.status_code, detail=f"Failed to fetch models: {list_resp.text}")
                
            models = list_resp.json().get("models", [])
            
            # Filter models that specifically support text generation
            valid_models = [m["name"] for m in models if "generateContent" in m.get("supportedGenerationMethods", [])]
            
            if not valid_models:
                raise HTTPException(status_code=404, detail="Your API key does not have access to any text generation models.")
                
            # 2. Pick the best available model automatically
            target_model = next((m for m in ["models/gemini-1.5-flash", "models/gemini-1.5-pro", "models/gemini-1.0-pro", "models/gemini-pro"] if m in valid_models), valid_models[0])

            # 3. Generate the test cases using the guaranteed-to-work model
            generate_url = f"https://generativelanguage.googleapis.com/v1beta/{target_model}:generateContent?key={api_key}"
            payload = {"contents": [{"parts": [{"text": request.prompt}]}]}

            response = await client.post(generate_url, json=payload)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {response.text}")
            return {"responseText": response.json()["candidates"][0]["content"]["parts"][0]["text"]}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8002,
        server_header=False,
        access_log=True
    )