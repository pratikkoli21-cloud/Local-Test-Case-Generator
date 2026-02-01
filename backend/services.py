import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_test_cases(source_code: str, language: str, framework: str, model: str, output_format: str = "code"):
    if output_format == "text":
        system_prompt = f"You are an expert Software QA Engineer. Your task is to provide a detailed natural language description of the test cases for the provided {language} code."
        system_prompt += "\nRules:\n1. Use a structured text format (e.g., Test Case ID, Description, Expected Result)."
        system_prompt += "\n2. Cover edge cases, success paths, and error handling."
        system_prompt += "\n3. Do not provide code. Provide clear logical steps for verification."
    else:
        system_prompt = f"You are an expert Software QA Engineer. Your task is to write comprehensive unit tests for the provided {language} code."
        system_prompt += f"\nRules:\n1. Use the '{framework}' testing framework."
        system_prompt += "\n2. Cover edge cases, success paths, and error handling."
        system_prompt += "\n3. Provide ONLY the code for the test file. No markdown formatting, no explanations."
        system_prompt += "\n4. If you need mocks, mock external dependencies."

    full_prompt = f"System Instruction: {system_prompt}\n\nSource Code:\n{source_code}\n\nGenerate the test file content now:"

    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=600)
        response.raise_for_status()
        result = response.json()
        
        # Clean up output (remove markdown if model disobeyed)
        test_code = result.get("response", "")
        test_code = test_code.replace("```python", "").replace("```", "").strip()
        
        return test_code, "success", None
    except Exception as e:
        return "", "error", str(e)
