<#
process-heroes-clean.ps1

Safe single-file implementation:
- Creates timestamped backup: tools/image-backups/<ts>/images/
- Restores non-hero files from that backup (overwrite)
- Resizes ONLY strict hero images to 1920x521 (center crop, HQ resample)
- Verifies final dimensions

Run from repo root:
  powershell -ExecutionPolicy Bypass -File tools/process-heroes-clean.ps1
#>

Param(
    [string]$ImagesDir = 'images',
    [int]$TargetW = 1920,
    [int]$TargetH = 521,
    [int]$JpegQuality = 85
)

Add-Type -AssemblyName System.Drawing

function New-Backup($src){
    $ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
    $out = Join-Path 'tools' ("image-backups\\$ts")
    New-Item -ItemType Directory -Path $out -Force | Out-Null
    $destImages = Join-Path $out 'images'
    Copy-Item -Path $src -Destination $destImages -Recurse -Force
    return $destImages
}

function Save-Jpeg($bitmap, $path, $quality){
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$quality)
    $bitmap.Save($path, $enc, $params)
}

try{
    $imagesFull = Join-Path (Get-Location) $ImagesDir
    if(-not (Test-Path $imagesFull)){ Write-Error "Images folder not found: $imagesFull"; exit 2 }

    $HeroList = @('hero_home.jpg','hero_tours.jpg','hero_customize.jpg','hero_about.jpg','hero_guide.jpg','hero_contact.jpg')

    Write-Host 'Backing up images...'
    $backup = New-Backup $imagesFull
    Write-Host "Backup at: $backup"

    # Restore non-hero files from backup
    $restored = 0
    Get-ChildItem -Path $backup -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($backup.Length).TrimStart('\','/')
        $target = Join-Path $imagesFull $rel
        $name = $_.Name
        if($HeroList -contains $name){ return }
        if($rel -match '^[\\/]*hero_'){ return }
        $td = Split-Path $target -Parent
        if(-not (Test-Path $td)){ New-Item -ItemType Directory -Path $td -Force | Out-Null }
        Copy-Item -Path $_.FullName -Destination $target -Force
        $restored += 1
    }
    Write-Host "Restored $restored non-hero files"

    # Gather hero files
    $heroes = @()
    foreach($h in $HeroList){ $p = Join-Path $imagesFull $h; if(Test-Path $p){ $heroes += $p } }
    Get-ChildItem -Path $imagesFull -File | Where-Object { $_.Name -like 'hero_*' } | ForEach-Object { if(-not ($heroes -contains $_.FullName)){ $heroes += $_.FullName } }

    if($heroes.Count -eq 0){ Write-Host 'No hero images found'; exit 0 }

    $processed = 0; $errors = @()
    foreach($hp in $heroes){
        try{
            $img = [System.Drawing.Image]::FromFile($hp)
            $w = $img.Width; $h = $img.Height
            $tr = [double]$TargetW / [double]$TargetH
            $sr = [double]$w / [double]$h
            if(($w -eq $TargetW) -and ($h -eq $TargetH)){ $img.Dispose(); continue }
            if($sr -gt $tr){ $newH = $h; $newW = [int]([math]::Round($newH * $tr)); $x = [int]([math]::Round(($w - $newW)/2)); $y = 0 } else { $newW = $w; $newH = [int]([math]::Round($newW / $tr)); $x = 0; $y = [int]([math]::Round(($h - $newH)/2)) }
            $crop = New-Object System.Drawing.Rectangle($x,$y,$newW,$newH)
            $cropBmp = New-Object System.Drawing.Bitmap($crop.Width,$crop.Height)
            $g = [System.Drawing.Graphics]::FromImage($cropBmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($img, 0,0, $crop.Width, $crop.Height, $crop.X, $crop.Y, $crop.Width, $crop.Height, [System.Drawing.GraphicsUnit]::Pixel)
            $out = New-Object System.Drawing.Bitmap($TargetW,$TargetH)
            $g2 = [System.Drawing.Graphics]::FromImage($out)
            $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g2.DrawImage($cropBmp, 0,0, $TargetW, $TargetH)
            $tmp = [System.IO.Path]::GetTempFileName()
            Save-Jpeg $out $tmp $JpegQuality
            Move-Item -Path $tmp -Destination $hp -Force
            $g.Dispose(); $g2.Dispose(); $cropBmp.Dispose(); $out.Dispose(); $img.Dispose()
            Write-Host "Processed: $(Split-Path $hp -Leaf)"
            $processed += 1
        } catch { $errors += $_.ToString() }
    }

    # Verify
    $fail = 0
    foreach($h in $heroes){ try{ $i = [System.Drawing.Image]::FromFile($h); if($i.Width -ne $TargetW -or $i.Height -ne $TargetH){ Write-Host "VERIFY FAIL: $(Split-Path $h -Leaf) -> $($i.Width)x$($i.Height)"; $fail += 1 } else { Write-Host "Verified: $(Split-Path $h -Leaf)" }; $i.Dispose() } catch { $errors += $_.ToString() } }

    Write-Host "Summary: processed=$processed, restored=$restored, verification_failed=$fail"
    if($errors.Count -gt 0){ Write-Host 'Errors:'; $errors | ForEach-Object { Write-Host $_ } }
    if($fail -gt 0){ Write-Error 'Verification failed'; exit 4 }
    exit 0

} catch { Write-Error "Script failed: $_"; exit 3 }
