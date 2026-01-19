# Generate image entries in cms-manifest.json for every file under images/
# Idempotent: updates or creates keys prefixed with 'auto.images.' and removes auto-entries for missing files.
# Exits non-zero on failures.

param(
    [string]$ImagesDir = "images",
    [string]$ManifestPath = "cms-manifest.json"
)

function SanitizeKeyPart($s){
    # replace non-alphanumeric with underscore, collapse multiple underscores
    $res = $s -replace '[^A-Za-z0-9]','_'
    $res = $res -replace '_+','_'
    $res = $res.Trim('_')
    if([string]::IsNullOrEmpty($res)){ throw "Cannot create key component from '$s'" }
    return $res.ToLower()
}

try{
    $cwd = Get-Location
    $imagesFull = Join-Path $cwd $ImagesDir
    if(-not (Test-Path $imagesFull)){
        Write-Error "Images directory not found: $imagesFull"
        exit 2
    }

    $extensions = @('*.jpg','*.jpeg','*.png','*.svg','*.gif','*.webp')
    $files = @()
    foreach($ext in $extensions){
        $files += Get-ChildItem -Path $imagesFull -Recurse -Include $ext -File -ErrorAction SilentlyContinue
    }

    # Load or initialize manifest
    if(Test-Path $ManifestPath){
        $raw = Get-Content -Raw -Path $ManifestPath
        $manifest = $raw | ConvertFrom-Json -ErrorAction Stop
    } else {
        $manifest = @{}
    }

    if(-not $manifest.PSObject.Properties.Name -contains 'images'){
        $manifest | Add-Member -MemberType NoteProperty -Name images -Value @{}
    }
    if(-not $manifest.PSObject.Properties.Name -contains 'images_meta'){
        $manifest | Add-Member -MemberType NoteProperty -Name images_meta -Value @{}
    }

    $existingImages = @{}
    $manifest.images.PSObject.Properties | ForEach-Object { $existingImages[$_.Name] = $_.Value }

    $generated = @{}
    foreach($f in $files){
        $rel = Resolve-Path -Relative -Path $f.FullName
        # normalize and strip leading ./ or .\ from Resolve-Path output
        $rel = $rel -replace '^[.][\\/]+',''
        # make relative to images dir
        $relPath = $rel -replace "^$ImagesDir[\\/]?","" -replace '\\','/'
        $relPathNoExt = [System.IO.Path]::ChangeExtension($relPath, $null)
        $parts = $relPathNoExt -split '/'
        # skip hidden files or segments
        if(($parts | Where-Object { $_ -and $_.StartsWith('.') }).Count -gt 0){ Write-Host "Skipping hidden file: $relPath"; continue }
        $parts = $parts | Where-Object { $_ -ne '' } | ForEach-Object { SanitizeKeyPart $_ }
        $key = "auto.images." + ($parts -join '.')
        $value = ($ImagesDir.TrimEnd('/') + '/' + $relPath).Replace('\','/')
        $generated[$key] = $value
    }

    # Remove stale auto.images.* entries from manifest.images
    $toRemove = @()
    foreach($k in $existingImages.Keys){
        if($k -like 'auto.images.*' -and -not ($generated.Contains($k))){
            $toRemove += $k
        }
    }
    foreach($k in $toRemove){
        $manifest.images.PSObject.Properties.Remove($k) | Out-Null
        if($manifest.images_meta.PSObject.Properties.Name -contains $k){ $manifest.images_meta.PSObject.Properties.Remove($k) | Out-Null }
        Write-Host "Removed stale manifest image key: $k"
    }

    # Add or update generated entries
    foreach($kv in $generated.GetEnumerator()){
        $k = $kv.Key; $v = $kv.Value
        if($manifest.images.PSObject.Properties.Name -contains $k){
            if($manifest.images.$k -ne $v){ $manifest.images.$k = $v; Write-Host "Updated manifest.images.$k -> $v" }
        } else {
            $manifest.images | Add-Member -MemberType NoteProperty -Name $k -Value $v
            Write-Host "Added manifest.images.$k -> $v"
        }
        # ensure an images_meta entry exists (non-required by default)
        if(-not ($manifest.images_meta.PSObject.Properties.Name -contains $k)){
            $meta = @{ type = 'image'; usage = 'asset'; targets = @(); required = $false }
            $manifest.images_meta | Add-Member -MemberType NoteProperty -Name $k -Value ($meta | ConvertTo-Json -Compress) -Force
            # Note: storing meta as an object in JSON; ConvertTo-Json handled later
        }
    }

    # Convert manifest back to plain hashtables for correct JSON
    $out = @{ }
    foreach($p in $manifest.PSObject.Properties){
        if($p.Name -eq 'images_meta'){
            # images_meta currently has stringified JSON values for each property; rebuild properly
            $metaObj = @{}
            foreach($m in $manifest.images_meta.PSObject.Properties){
                $rawMeta = $manifest.images_meta.$($m.Name)
                # If the value is a JSON string (from earlier), attempt to parse; otherwise use as-is
                try{
                    $parsed = $rawMeta | ConvertFrom-Json -ErrorAction Stop
                    $metaObj[$m.Name] = $parsed
                }catch{
                    $metaObj[$m.Name] = $rawMeta
                }
            }
            $out[$p.Name] = $metaObj
        } else {
            $out[$p.Name] = $p.Value
        }
    }

    # Write back JSON with stable ordering: site, backgrounds, backgrounds_meta, images, images_meta, packages, others
    $ordered = [ordered]@{}
    if($out.PSObject.Properties.Name -contains 'site'){ $ordered['site'] = $out['site'] }
    if($out.PSObject.Properties.Name -contains 'backgrounds'){ $ordered['backgrounds'] = $out['backgrounds'] }
    if($out.PSObject.Properties.Name -contains 'backgrounds_meta'){ $ordered['backgrounds_meta'] = $out['backgrounds_meta'] }
    $ordered['images'] = ($out.images | Sort-Object Name | ForEach-Object { @{ ($_ ) = $out.images.$_ } })
    # Rebuild images properly
    $imagesObj = [ordered]@{}
    foreach($name in ($out.images.PSObject.Properties | Select-Object -ExpandProperty Name | Sort-Object)){
        $imagesObj[$name] = $out.images.$name
    }
    $ordered['images'] = $imagesObj
    if($out.PSObject.Properties.Name -contains 'images_meta'){ $ordered['images_meta'] = $out['images_meta'] }
    if($out.PSObject.Properties.Name -contains 'packages'){ $ordered['packages'] = $out['packages'] }

    # include any other keys unchanged
    foreach($p in $out.Keys){ if(-not ($ordered.Contains($p))){ $ordered[$p] = $out[$p] } }

    $json = $ordered | ConvertTo-Json -Depth 10
    # Pretty-format with indentation (ConvertTo-Json is acceptable)
    Set-Content -Path $ManifestPath -Value $json -Encoding UTF8

    Write-Host "Image manifest generation complete. Total images registered: $($generated.Count)"
    exit 0
}catch{
    Write-Error "Image manifest generation failed: $_"
    exit 3
}
