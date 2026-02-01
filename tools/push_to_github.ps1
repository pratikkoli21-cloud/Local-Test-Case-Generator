$RemoteUrl = "https://github.com/pratikkoli21-cloud/AITesterBluePrintProjects.git"

Write-Host "1. Initializing Git Repository..." -ForegroundColor Cyan
git init

Write-Host "2. Adding files..." -ForegroundColor Cyan
git add .

Write-Host "3. Committing..." -ForegroundColor Cyan
git commit -m "Initial commit: Local Test Case Generator complete"

Write-Host "4. Adding Remote ($RemoteUrl)..." -ForegroundColor Cyan
git branch -M main
git remote add origin $RemoteUrl

Write-Host "5. Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "Done!" -ForegroundColor Green
