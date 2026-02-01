# Project Constitution

## Data Schemas

### Core Domain Models

#### 1. CLI Input Arguments
The arguments provided to `TestGen.ps1`
```powershell
-File <Path to source file>   # Mandatory
-Framework <string>           # Optional (e.g., "pytest", "nunit")
-Output <Path to output file> # Optional (Default: test_<filename>)
```

#### 2. Ollama Payload (Internal)
Structure sent to localhost:11434
```json
{
  "model": "llama3.2",
  "prompt": "...", // Composed of System Prompt + User Code
  "stream": false
}
```

## Behavioral Rules
1.  **Pure PowerShell**: No dependencies on Python/Node/cURL. Use `Invoke-WebRequest`.
2.  **Streaming Disabled**: For simplicity in V1, we will wait for the full response and then write to file.
3.  **Visual Feedback**: Use `Write-Progress` or status messages so the user knows the AI is thinking.

## Architectural Invariants
1.  **Local Execution**: Everything runs on the user's machine.
2.  **Single File Delivery**: The main logic should live in `TestGen.ps1` (or minimal supporting files) for easy portability.
