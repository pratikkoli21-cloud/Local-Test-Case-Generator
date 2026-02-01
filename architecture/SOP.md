# Standard Operating Procedure (SOP): Test Case Generation

## Overview

This SOP defines the deterministic process for converting source code into high-quality unit tests using a local LLM (Ollama).

## Workflow

### 1. Request Handling

- **Input**: Source code, target language, and desired testing framework.
- **Validation**: Ensure the input code is not empty and the target language is supported.

### 2. Prompt Construction (Deterministic Layer)

- **Template Selection**: Load the standard prompt template from `backend/services.py` or `TestGen.ps1`.
- **Context Injection**:
  - Inject the specific source code into the prompt.
  - Explicitly state the module name (inferred from filename) to ensure correct imports in the generated test.
  - Apply strict constraints: "Return ONLY code", "No markdown", "No explanations".

### 3. LLM Execution (Probabilistic Layer)

- **Call**: Dispatch a non-streaming POST request to `localhost:11434/api/generate`.
- **Model**: Default to `llama3.2`.
- **Timeout**: Set a 600-second timeout to allow for large file processing on local hardware.

### 4. Output Processing

- **Cleaning**: Automatically strip any markdown backticks (e.g., ` ```python `) if the LLM fails to follow the "No markdown" constraint.
- **Normalization**: Ensure the output is saved with UTF-8 encoding to support diverse character sets.

### 5. Delivery

- **CLI**: Save to `test_<filename>`.
- **Web**: Return via JSON payload.

## Error Handling

- **API Failure**: If Ollama is unreachable, report "Backend Offline".
- **Empty Response**: If the LLM returns an empty string, do not overwrite existing files; return an error status.
