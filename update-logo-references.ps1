# Update all logo image references to use the new SVG symbol
Write-Host "=== UPDATING LOGO REFERENCES ===" -ForegroundColor Cyan
Write-Host ""

$pagesUpdated = 0

Get-ChildItem -Path "." -Filter "*.html" -Recurse | Where-Object {
    $_.Name -notlike "*node_modules*" -and
    $_.Name -notlike "logo-*" -and
    $_.Name -notlike "update-*"
} | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw

    # Only update the main logo image in the header, not favicons or meta images
    $updated = $false

    # Look for the specific pattern in the logo link
    if ($content -match '<a href="[^"]*" class="logo">\s*<img loading="lazy" src="images/assets/logo\.png" alt="Morocco Trek Tours" class="logo-img">') {
        $content = $content -replace '<img loading="lazy" src="images/assets/logo\.png" alt="Morocco Trek Tours" class="logo-img">', '<img loading="lazy" src="logo-symbol-only.svg" alt="Morocco Trek Tours" class="logo-img">'
        $updated = $true
    }

    if ($updated) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Updated logo in: $($_.Name)" -ForegroundColor Green
        $pagesUpdated++
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Pages updated: $pagesUpdated" -ForegroundColor Green
Write-Host "Logo image changed from: images/assets/logo.png" -ForegroundColor Yellow
Write-Host "Logo image changed to: logo-symbol-only.svg" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All logo instances in headers have been updated!" -ForegroundColor Green