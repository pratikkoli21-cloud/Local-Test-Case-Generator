# Task Plan (Revised: PowerShell Edition)

## Phase 1: Planning and Design

- [x] Define Discovery Questions
- [x] Receive User Requirements
- [x] Define Data Schema (Updated for CLI)
- [x] Approve Blueprint

## Phase 2: Link (Connectivity)

- [x] Verify Ollama Connection
- [x] Download `llama3.2` model
- [x] Verify Script Execution Policy

## Phase 3: The PowerShell Tool (CLI)

- [x] Construct `TestGen.ps1` (Functional)
- [x] Test with sample `calculator.py`
- [x] Verify "pytest" output format (Refined Payload)

## Phase 4: Stylize (Refinement & UI)

- [x] **CLI UX Upgrade**: Add colors, banners, and better status messages to `TestGen.ps1`.
- [x] **Final Verification**: Run the stylized tool to ensure no regressions.
- [x] Documentation (`README.md` with Diagram created).

## Phase 5: Backend Development (FastAPI)

- [x] Initialize `backend/` directory.
- [x] Create `requirements.txt` with `fastapi`, `uvicorn`, `requests`.
- [x] Create `backend/schemas.py` for API data models.
- [x] Create `backend/services.py` for Ollama interaction logic.
- [x] Create `backend/main.py` for FastAPI endpoints (CORS enabled).
- [x] Test the backend using `curl` or a test script.

## Phase 6: Frontend Development (Premium UI)

- [x] Initialize `frontend/` directory.
- [x] Create `frontend/index.html` (Single-file SPA).
- [x] Implement "Premium Design" (Dark mode, glassmorphism).
- [x] Integrate with Backend API.
- [x] Add syntax highlighting and loading states.

## Phase 7: Architecture Documentation (SOP)

- [x] Create `architecture/` directory.
- [x] Write `architecture/SOP.md` (Deterministic workflows).
- [x] Write `architecture/SYSTEM_DESIGN.md` (3-Layer structure).

## Phase 8: Version Control & Deployment

- [x] Create `.gitignore`.
- [x] Create deployment script (`tools/push_to_github.ps1`).
- [ ] **USER ACTION**: Run `.\tools\push_to_github.ps1` (Git not found in PATH).
- [ ] Commit source code.
- [ ] Push to GitHub Remote.
