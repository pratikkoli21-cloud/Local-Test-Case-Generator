$ollamaUrl = "http://localhost:11434"
$modelName = "llama3.2"

Write-Host "Phase 2: Link Verification for $modelName..."

# 1. Check if Ollama is running
try {
    $response = Invoke-WebRequest -Uri "$ollamaUrl/api/tags" -Method Get -ErrorAction Stop
    Write-Host "Ollama API is reachable at $ollamaUrl"
}
catch {
    Write-Error "Could not connect to Ollama at $ollamaUrl. Is it running?"
    exit 1
}

# 2. Check if model exists
$json = $response.Content | ConvertFrom-Json
$modelExists = $false

if ($json.models) {
    foreach ($model in $json.models) {
        if ($model.name -like "*$modelName*") {
            $modelExists = $true
            break
        }
    }
}

# 3. Pull model if missing
if (-not $modelExists) {
    Write-Host "Model '$modelName' not found. Attempting to pull via API..."
    $pullPayload = @{ name = $modelName } | ConvertTo-Json
    
    # Increase timeout for pull
    try {
        Invoke-WebRequest -Uri "$ollamaUrl/api/pull" -Method Post -Body $pullPayload -TimeoutSec 1200 -ContentType "application/json" | Out-Null
        Write-Host "Model pull command sent (or completed)."
    }
    catch {
        Write-Error "Failed to pull model: $_"
        exit 1
    }
}
else {
    Write-Host "Model '$modelName' is already available."
}

# 4. Handshake (Generation Test)
Write-Host "Testing Generation..."
$promptPayload = @{
    model  = $modelName
    prompt = "Reply with exactly the word: Connected"
    stream = $false
} | ConvertTo-Json

try {
    $genResponse = Invoke-WebRequest -Uri "$ollamaUrl/api/generate" -Method Post -Body $promptPayload -ContentType "application/json" -ErrorAction Stop
    $genJson = $genResponse.Content | ConvertFrom-Json
    $output = $genJson.response.Trim()
    
    if ($output -match "Connected") {
        Write-Host "Handshake Successful! Model replied: $output"
    }
    else {
        Write-Warning "Model replied, but output was unexpected: $output"
    }
}
catch {
    Write-Error "Generation failed: $_"
    exit 1
}

Write-Host "Phase 2 Complete: Link is verified."
