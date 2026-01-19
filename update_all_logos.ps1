# Update logo structure in all HTML files
Get-ChildItem -Path "." -Filter "*.html" -Recurse | Where-Object {
    $_.Name -notlike "*node_modules*" -and
    $_.Name -notlike "logo-*" -and
    $_.Name -notlike "update_*"
} | ForEach-Object {
    $file = $_.FullName
    $fileName = $_.Name
    Write-Host "Processing $fileName"

    # Read file content
    $content = Get-Content $file -Raw

    # Determine if it's French or English
    $isFrench = $fileName -like "*-fr.html"
    $indexLink = if ($isFrench) { "index-fr.html" } else { "index.html" }
    $subtitle = if ($isFrench) {
        "votre passerelle vers l'aventure authentique"
    } else {
        "your gateway to the authentic adventure"
    }

    # Replace the logo structure
    $oldPattern = '<a href="' + $indexLink + '" class="logo">\s*<img loading="lazy" src="images/assets/logo.png" alt="Morocco Trek Tours" class="logo-img">\s*<div class="logo-subtitle">' + [regex]::Escape($subtitle) + '</div>\s*</a>'

    $newStructure = @"
            <a href="$indexLink" class="logo">
                <img loading="lazy" src="images/assets/logo.png" alt="Morocco Trek Tours" class="logo-img">
                <div class="logo-text">
                    <div class="logo-title">Morocco Trek Tours</div>
                    <div class="logo-subtitle">$subtitle</div>
                </div>
            </a>
"@

    # Replace using regex
    $content = [regex]::Replace($content, $oldPattern, $newStructure, [System.Text.RegularExpressions.RegexOptions]::Singleline)

    # Write back to file
    Set-Content -Path $file -Value $content -NoNewline
}

Write-Host "All logo structures updated!"