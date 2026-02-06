# Script to add Page Transitions to all HTML files
# Morocco Trek Tours - Page Transitions Auto-Installer

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Morocco Trek Tours - Page Transitions Setup  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$cssLine = '    <link rel="stylesheet" href="css/page-transitions.css">'
$jsLine = '    <script src="js/page-transitions.js"></script>'

# Get all HTML files in the root directory
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" | Where-Object { $_.Name -notlike "test-*" -and $_.Name -notlike "logo-*" }

$updatedCount = 0
$skippedCount = 0

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Check if CSS is already added
    if ($content -notmatch "page-transitions\.css") {
        # Find the position to insert CSS (after mobile-fixes.css or before </head>)
        if ($content -match "mobile-fixes\.css.*?\r?\n") {
            $content = $content -replace "(mobile-fixes\.css.*?\r?\n)", "`$1$cssLine`r`n"
            $modified = $true
            Write-Host "  ✓ Added CSS reference" -ForegroundColor Green
        }
        elseif ($content -match "</head>") {
            $content = $content -replace "</head>", "$cssLine`r`n</head>"
            $modified = $true
            Write-Host "  ✓ Added CSS reference (before </head>)" -ForegroundColor Green
        }
    } else {
        Write-Host "  - CSS already exists" -ForegroundColor Gray
    }
    
    # Check if JS is already added
    if ($content -notmatch "page-transitions\.js") {
        # Find the position to insert JS (after main.js or before </body>)
        if ($content -match "main\.js.*?\r?\n") {
            $content = $content -replace "(main\.js.*?\r?\n)", "`$1$jsLine`r`n"
            $modified = $true
            Write-Host "  ✓ Added JS reference" -ForegroundColor Green
        }
        elseif ($content -match "</body>") {
            $content = $content -replace "</body>", "$jsLine`r`n</body>"
            $modified = $true
            Write-Host "  ✓ Added JS reference (before </body>)" -ForegroundColor Green
        }
    } else {
        Write-Host "  - JS already exists" -ForegroundColor Gray
    }
    
    # Save the file if modified
    if ($modified) {
        $content | Set-Content $file.FullName -Encoding UTF8 -NoNewline
        $updatedCount++
        Write-Host "  ✓ File updated successfully!" -ForegroundColor Green
    } else {
        $skippedCount++
        Write-Host "  - File skipped (already up to date)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "                   SUMMARY                      " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Total files processed: $($htmlFiles.Count)" -ForegroundColor White
Write-Host "Files updated: $updatedCount" -ForegroundColor Green
Write-Host "Files skipped: $skippedCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Page Transitions setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test on mobile device or Chrome DevTools" -ForegroundColor White
Write-Host "2. Verify smooth transitions between pages" -ForegroundColor White
Write-Host "3. Check that no white flash appears" -ForegroundColor White
Write-Host ""
