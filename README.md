# ✨ AI Test Case Generator

An AI-powered QA tool that automatically generates exhaustive, detailed test cases from Business Requirement Documents (BRDs), Jira stories, or pasted requirements. It dynamically queries Google's Gemini API to analyze requirements and exports the results into beautifully formatted Excel (`.xlsx`) files.

## 🚀 Features

- **Smart AI Analysis:** Powered by Google's Gemini API to guarantee high test coverage. Includes an intelligent fallback mechanism if specific models are under high demand.
- **Multiple Focus Areas:** Generate test cases specifically for Functional, Negative, Boundary, Integration, UI/UX, Performance, or Security testing.
- **Rich Excel Export:** Downloads perfectly formatted Excel files with text-wrapping, custom-colored headers, and auto-adjusting column widths natively using `exceljs`.
- **File Upload:** Drag and drop or upload your requirement documents.
- **Token Auto-Rescue:** Gracefully handles and rescues valid test cases even if the AI hits its maximum token limits on massive BRDs.

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- Python (3.8 or higher)
- A free Google Gemini API Key

## 💻 Local Setup Instructions

To run this application locally, you will need to start both the Python backend and the React frontend simultaneously in two separate terminal windows.

### 1. Start the Python Backend

Open your first terminal window, navigate to the project directory, and run:

```bash
# Install the required Python packages
pip install fastapi uvicorn httpx pydantic

# Set your Gemini API key
# For Windows Command Prompt:
set GEMINI_API_KEY=your_api_key_here

# For Windows PowerShell:
$env:GEMINI_API_KEY="your_api_key_here"

# For Mac/Linux:
export GEMINI_API_KEY="your_api_key_here"

# Start the FastAPI backend
python backend.py
```

### 2. Start the React Frontend

Open a **second, entirely separate terminal window**, navigate to the project directory, and run:

```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser to the URL provided in the terminal (usually `http://localhost:8080`) and start generating test cases!
