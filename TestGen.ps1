<#
.SYNOPSIS
    Gemini Local Test Generator (Premium CLI)
.DESCRIPTION
    Generates unit tests using local Ollama models with a styled interface.
#>

param([string]$File)

# --- Configuration ---
$OllamaUrl = 'http://localhost:11434/api/generate'
$Model = 'llama3.2'

# --- Helper Functions ---
function Write-Logo {
    Write-Host ""
    Write-Host "   ======================================   " -ForegroundColor Cyan
    Write-Host "       GEMINI TEST GENERATOR (LOCAL)        " -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "   ======================================   " -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step([string]$Icon, [string]$Text) {
    Write-Host " $Icon " -NoNewline -ForegroundColor Green
    Write-Host $Text -ForegroundColor White
}

function Write-Info([string]$Label, [string]$Value) {
    # Fix: avoid colon parsing issues by concatenating
    $Msg = "   - " + $Label + ": "
    Write-Host $Msg -NoNewline -ForegroundColor Gray
    Write-Host $Value -ForegroundColor Yellow
}

# --- Main Execution ---
Clear-Host
Write-Logo

# 1. Validation
if (-not $File) {
    Write-Host " [!] Error: Please provide a file." -ForegroundColor Red
    Write-Host "     Usage: .\TestGen.ps1 -File .\script.py" -ForegroundColor Gray
    exit 1
}

if (-not (Test-Path $File)) { 
    Write-Host " [!] Error: File '$File' not found." -ForegroundColor Red
    exit 1 
}

$FileItem = Get-Item $File
$FileContent = Get-Content $File -Raw
$FileBase = $FileItem.BaseName
$Output = "test_" + $FileBase + ".py"

# 2. Display Info
Write-Step "1" "Configuration Loaded"
Write-Info "Source" $FileItem.Name
Write-Info "Target" "pytest"
Write-Info "Model"  $Model
Write-Host ""

# 3. Build Prompt
Write-Step "2" "Building Prompt Strategy"
$Prompt = "Your Task: Write a complete 'pytest' file for the following code. "
$Prompt += "Rules: "
$Prompt += "1. Import functions from module '$FileBase'. "
$Prompt += "2. Write test functions starting with 'test_'. "
$Prompt += "3. Do NOT provide explanations. Output ONLY the python code."
$Prompt += "`n`nCode:`n" + $FileContent

$Body = @{
    model  = $Model
    prompt = $Prompt
    stream = $false
} | ConvertTo-Json

# 4. Execute
Write-Step "3" "Detailed Analysis & Generation (Ollama)"
Write-Host "     (This uses your local GPU/CPU, please wait...)" -ForegroundColor DarkGray

try {
    $Res = Invoke-WebRequest -Uri $OllamaUrl -Method Post -Body $Body -ContentType 'application/json' -TimeoutSec 600
    $Json = $Res.Content | ConvertFrom-Json
    
    # 5. Extract & Clean
    $Code = $Json.response.Replace('```python', '').Replace('```', '')
    
    # 6. Save
    $Code | Out-File $Output -Encoding UTF8
    
    Write-Host ""
    Write-Host " [SUCCESS] Tests generated successfully!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "           Saved to: $Output" -ForegroundColor Cyan
    Write-Host ""

}
catch {
    Write-Host ""
    Write-Host " [ERROR] Failed to generate tests." -ForegroundColor Red
    Write-Host "         Details: $_" -ForegroundColor Gray
}
