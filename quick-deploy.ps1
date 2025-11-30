Write-Host "🔨 Building..." -ForegroundColor Cyan
npm run build
Write-Host ""
Write-Host "🚀 Deploying..." -ForegroundColor Cyan
firebase deploy --only hosting
Write-Host ""
Write-Host "✅ Done! https://tmdt-web-2025.web.app" -ForegroundColor Green
