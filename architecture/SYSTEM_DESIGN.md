# System Design: 3-Layer Architecture

This project follows the **Deterministic Separation Principle** to ensure that while the AI (probabilistic) generates the content, the business logic (deterministic) remains rigid and reliable.

## Layer 1: Architecture (The "Constitution")

- **Location**: `architecture/`, `gemini.md`, `BLAST.md`.
- **Role**: Defines the rules of engagement. Every code change must be preceded by a design update in this layer if the logic changes.
- **Artifacts**: `SOP.md`, `SYSTEM_DESIGN.md`.

## Layer 2: Navigation (The "Brain")

- **Location**: `backend/main.py`, `TestGen.ps1`.
- **Role**: Orchestrates the data flow. It doesn't write code; it routes the user's input, applies the templates defined in the SOP, and communicates with the LLM or File System.
- **Logic**:
  - Argument parsing.
  - Environment detection (e.g., inferring `pytest` for `.py` files).
  - Status reporting.

## Layer 3: Tools (The "Execution")

- **Location**: `backend/services.py`, `tools/`.
- **Role**: Atomic, deterministic scripts and API calls.
- **Components**:
  - `handshake_ollama.ps1`: Verifies the link.
  - `services.py`: Hardened logic for calling the Ollama API and post-processing the string response.

## Data Flow Diagram

`USER INTERFACE` (Frontend/CLI)
      ↓
`NAVIGATION LAYER` (Validates input, selects Template)
      ↓
`TOOL LAYER` (Calls Ollama API)
      ↓
`OLLAMA` (Generates Probabilistic Output)
      ↓
`TOOL LAYER` (Cleans and filters output)
      ↓
`NAVIGATION LAYER` (Saves to file / Returns to UI)
