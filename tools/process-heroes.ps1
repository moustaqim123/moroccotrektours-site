<#
process-heroes.ps1 — single clean implementation

Backs up `images/` to `tools/image-backups/<ts>/images/`, restores non-hero
files from that backup (overwrite), and resizes ONLY the strict hero list and
root-level `hero_*` files to 1920x521 using a center-weighted crop.

Strict: only hero files are modified.
#>

# Removed duplicate Param block; single Param block remains below.
<#
tools/process-heroes.ps1

Strict behavior:
- Creates a timestamped backup of the `images/` folder at `tools/image-backups/<ts>/images/`.
- Restores ALL non-hero images from that backup (overwrite) so card/package thumbnails revert.
- Resizes ONLY the strict hero filenames and any root-level files starting with `hero_` to 1920x521 px
  using a center-weighted crop and high-quality resampling, saving as JPEG at chosen quality.
- Exits non-zero if verification fails.

Usage: from repository root:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\process-heroes.ps1 -ImagesDir images
#>

Param(
    [string]$ImagesDir = 'images',
    [int]$TargetW = 1920,
    [int]$TargetH = 521,
    [int]$JpegQuality = 85
)

Add-Type -AssemblyName System.Drawing

function New-BackupDirectory($srcPath){
    $ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
    $outRoot = Join-Path -Path (Join-Path -Path (Get-Location) -ChildPath 'tools') -ChildPath "image-backups"
    $out = Join-Path -Path $outRoot -ChildPath $ts
    New-Item -ItemType Directory -Path $out -Force | Out-Null
    $destImages = Join-Path -Path $out -ChildPath 'images'
    Copy-Item -Path $srcPath -Destination $destImages -Recurse -Force
    return (Resolve-Path $destImages).Path
}

function Save-Jpeg($bitmap, $path, $quality){
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$quality)
    $bitmap.Save($path, $enc, $params)
}

try{
    $imagesFull = (Resolve-Path -Path $ImagesDir -ErrorAction Stop).Path
} catch {
    Write-Error "Images folder not found: $ImagesDir"
    exit 2
}

$HeroList = @('hero_home.jpg','hero_tours.jpg','hero_customize.jpg','hero_about.jpg','hero_guide.jpg','hero_contact.jpg')

Write-Host "Creating timestamped backup of $imagesFull..."
$backupImages = New-BackupDirectory -srcPath $imagesFull
Write-Host "Backup created at: $backupImages"

# Restore non-hero files from backup (overwrite)
$restored = 0
Get-ChildItem -Path $backupImages -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($backupImages.Length).TrimStart('\','/')
    $target = Join-Path -Path $imagesFull -ChildPath $rel
    $name = $_.Name
    # Skip hero files (strict list) and any root-level hero_* entries
    if($HeroList -contains $name){ return }
    if($rel -match '^[\\/]*hero_'){ return }
    $td = Split-Path -Path $target -Parent
    if(-not (Test-Path $td)){ New-Item -ItemType Directory -Path $td -Force | Out-Null }
    Copy-Item -Path $_.FullName -Destination $target -Force
    $restored += 1
}
Write-Host "Restored $restored non-hero files from backup"

# Collect hero files: explicit list (root) + any root-level files starting with hero_
$heroes = @()
foreach($h in $HeroList){ $p = Join-Path -Path $imagesFull -ChildPath $h; if(Test-Path $p){ $heroes += (Resolve-Path $p).Path } }
Get-ChildItem -Path $imagesFull -File -Force | Where-Object { $_.Name -like 'hero_*' } | ForEach-Object { if(-not ($heroes -contains $_.FullName)){ $heroes += $_.FullName } }

if($heroes.Count -eq 0){ Write-Host 'No hero images found to process.'; exit 0 }

$processed = 0
$errors = @()
foreach($hp in $heroes){
    try{
        $img = [System.Drawing.Image]::FromFile($hp)
        $w = $img.Width; $h = $img.Height
        if(($w -eq $TargetW) -and ($h -eq $TargetH)){ Write-Host "Already target size: $(Split-Path $hp -Leaf)"; $img.Dispose(); continue }

        $targetRatio = [double]$TargetW / [double]$TargetH
        $srcRatio = [double]$w / [double]$h

        if($srcRatio -gt $targetRatio){
            $newH = $h
            $newW = [int]([math]::Round($newH * $targetRatio))
            $x = [int]([math]::Round(($w - $newW)/2)); $y = 0
        } else {
            $newW = $w
            $newH = [int]([math]::Round($newW / $targetRatio))
            $x = 0; $y = [int]([math]::Round(($h - $newH)/2))
        }

        $crop = New-Object System.Drawing.Rectangle($x,$y,$newW,$newH)
        $cropBmp = New-Object System.Drawing.Bitmap($crop.Width,$crop.Height)
        $g = [System.Drawing.Graphics]::FromImage($cropBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $destRect = [System.Drawing.Rectangle]::new(0,0,$crop.Width,$crop.Height)
        $g.DrawImage($img, $destRect, $crop, [System.Drawing.GraphicsUnit]::Pixel)

        $out = New-Object System.Drawing.Bitmap($TargetW,$TargetH)
        $g2 = [System.Drawing.Graphics]::FromImage($out)
        $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g2.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g2.DrawImage($cropBmp, 0,0, $TargetW, $TargetH)

        $tmp = [System.IO.Path]::GetTempFileName()
        Save-Jpeg $out $tmp $JpegQuality

        # Dispose all GDI objects BEFORE replacing the file to release locks
        $g.Dispose(); $g2.Dispose(); $cropBmp.Dispose(); $out.Dispose(); $img.Dispose()

        try{
            Move-Item -Path $tmp -Destination $hp -Force
        } catch {
            Copy-Item -Path $tmp -Destination $hp -Force
            Remove-Item -Path $tmp -Force
        }

        Write-Host "Processed hero: $(Split-Path $hp -Leaf)"
        $processed += 1
    } catch {
        $errors += ("Error processing $hp : " + $_.ToString())
    }
}

# Verification
$fail = 0
foreach($h in $heroes){
    try{
        $i = [System.Drawing.Image]::FromFile($h)
        if($i.Width -ne $TargetW -or $i.Height -ne $TargetH){ Write-Host "VERIFY FAIL: $(Split-Path $h -Leaf) -> $($i.Width)x$($i.Height)"; $fail += 1 } else { Write-Host "Verified: $(Split-Path $h -Leaf) -> $TargetW x $TargetH" }
        $i.Dispose()
    } catch { $errors += ("Error verifying $h : " + $_.ToString()) }
}

Write-Host "Summary: processed=$processed, restored_non_hero=$restored, verification_failed=$fail"
if($errors.Count -gt 0){ Write-Host 'Errors:'; $errors | ForEach-Object { Write-Host $_ } }
if($fail -gt 0){ Write-Error 'One or more hero images failed verification'; exit 4 }

Write-Host 'All done.'; exit 0

catch {
    Write-Error ("Script failed: " + $_.ToString())
    exit 3
}
    # explicit hero filenames
