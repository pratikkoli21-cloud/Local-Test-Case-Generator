# Findings

## Research
- **Project**: Local LLM Testcase Generator with Ollama
- **Goal**: Create a tool using Ollama API to generate test cases.
- **Relevant Existing Tools**:
    - `pankajsarmah10/ai-testdata-generator`: Selenium + Ollama for test data.
    - `Laszlobeer/llm-tester`: Benchmarking Ollama models.
    - `nalinrajendran/synthetic-LLM-QA-dataset-generator`: QA dataset from text/PDF.
- **Testing Ollama Clients**:
    - Strategies: Unit tests with mocks, Integration tests (VCR.py), End-to-End.
    - Key Areas: Model interactions (generate/chat), Streaming, Error handling, Model management (pull/create).
    - Function Calling: Verifying tool invocations if used.

## Constraints
- Must use Ollama.
- Must follow BLAST.md protocol.
- **Protocol 0**: Halted until Blueprint & Schema approved.
