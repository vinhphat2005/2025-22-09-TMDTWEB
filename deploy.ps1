Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Cyan
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deploy successful!" -ForegroundColor Green
        Write-Host "🌐 Website: https://tmdt-web-2025.web.app" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Deploy failed!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
}
