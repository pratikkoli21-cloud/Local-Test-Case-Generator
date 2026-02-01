from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.schemas import TestCaseRequest, TestCaseResponse
from backend.services import generate_test_cases

app = FastAPI(title="Local LLM Test Case Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate", response_model=TestCaseResponse)
async def generate(request: TestCaseRequest):
    # Default framework if not provided
    framework = request.testing_framework
    if not framework:
        if request.language.lower() == "python":
            framework = "pytest"
        elif request.language.lower() in ["javascript", "typescript"]:
            framework = "jest"
        else:
            framework = "generic unit tests"

    test_code, status, error_message = generate_test_cases(
        request.source_code, 
        request.language, 
        framework, 
        request.model,
        request.output_format
    )

    if status == "error":
        return TestCaseResponse(test_code="", status="error", error_message=error_message)
    
    return TestCaseResponse(test_code=test_code, status="success")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
