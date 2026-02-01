from pydantic import BaseModel
from typing import Optional

class TestCaseRequest(BaseModel):
    source_code: str
    language: str = "python"
    testing_framework: Optional[str] = None
    model: str = "llama3.2"
    output_format: str = "code" # 'code' or 'text'

class TestCaseResponse(BaseModel):
    test_code: str
    status: str
    error_message: Optional[str] = None
