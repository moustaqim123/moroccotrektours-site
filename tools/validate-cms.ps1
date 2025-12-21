# Validate CMS enforcement script
# Exits with code 1 if violations are found.

$errors = @()

# 1) No inline background-image or url(...) allowed (scan whole files)
Get-ChildItem -Path . -Recurse -Include *.html,*.htm,*.css | ForEach-Object {
    $text = Get-Content -Raw -Path $_.FullName
    if ($text -match 'background-image\s*:\s*url\(' -or $text -match 'url\('){
        $errors += "Forbidden url(...) or background-image found in: $($_.FullName)"
    }
}

# 2) No <img src="images/..." allowed (img must use data-cms-image)
Get-ChildItem -Path . -Recurse -Include *.html,*.htm | ForEach-Object {
    $lines = Get-Content -Path $_.FullName
    for ($i=0; $i -lt $lines.Length; $i++){
        $line = $lines[$i]
        if ($line -match '<img' -and $line -match 'src=' -and $line -match 'images/'){
            if ($line -notmatch 'data-cms-image'){
                $errors += "Found <img src= images/ without data-cms-image in $($_.FullName): L$($i+1)"
            }
        }
    }
}

# 3) Verify manifest contains all data-cms-bg and data-cms-image keys
$manifestPath = Join-Path (Get-Location) 'cms-manifest.json'
if (-Not (Test-Path $manifestPath)){
    $errors += "cms-manifest.json not found"
} else {
    $manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
    $allKeys = @()
    if ($manifest.backgrounds){ $manifest.backgrounds.PSObject.Properties | ForEach-Object { $allKeys += $_.Name } }
    if ($manifest.images){ $manifest.images.PSObject.Properties | ForEach-Object { $allKeys += $_.Name } }

    Get-ChildItem -Path . -Recurse -Include *.html,*.htm | ForEach-Object {
        $text = Get-Content -Raw -Path $_.FullName
        $matches = [regex]::Matches($text, 'data-cms-(bg|image)\s*=\s*"([^"]+)"')
        foreach ($m in $matches){
            $k = $m.Groups[2].Value
            if ($allKeys -notcontains $k){
                $errors += "Manifest missing key '$k' referenced in $($_.FullName)"
            }
        }
    }
}

if ($errors.Count -gt 0){
    Write-Host "CMS validation FAILED:`n"
    $errors | ForEach-Object { Write-Host "- $_" }
    exit 1
} else {
    Write-Host "CMS validation passed: no forbidden backgrounds or orphaned image/bg keys found." 
    exit 0
}
