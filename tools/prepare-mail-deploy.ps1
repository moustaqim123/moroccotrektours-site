#requires -Version 5.1
<#
    prepare-mail-deploy.ps1

    Builds the deployable contact-form layout inside public_html/ without
    touching the originals:

        public_html/vendor/                  <- copy of vendor/  (PHP includes only)
        public_html/private/email-config.php <- copy of private/email-config.php
        public_html/vendor/.htaccess         <- deny direct HTTP access
        public_html/private/.htaccess        <- deny direct HTTP access

    The SMTP configuration file is copied byte-for-byte; its values are never
    read, echoed or logged by this script.

    Usage (from the project root):
        powershell -ExecutionPolicy Bypass -File .\tools\prepare-mail-deploy.ps1
#>
[CmdletBinding()]
param(
    [string]$ProjectRoot = ''
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = Split-Path -Parent $PSScriptRoot
}

$root       = (Resolve-Path -LiteralPath $ProjectRoot).Path
$srcVendor  = Join-Path $root 'vendor'
$dstVendor  = Join-Path $root 'public_html\vendor'
$dstPrivate = Join-Path $root 'public_html\private'
$srcConfig  = Join-Path $root 'private\email-config.php'
$dstConfig  = Join-Path $dstPrivate 'email-config.php'
$failures   = New-Object System.Collections.Generic.List[string]

function Step([string]$Message) { Write-Host "[*] $Message" }

if (-not (Test-Path -LiteralPath $srcVendor -PathType Container)) { throw "Missing source directory: $srcVendor" }
if (-not (Test-Path -LiteralPath $srcConfig -PathType Leaf))      { throw "Missing source config: $srcConfig" }

New-Item -ItemType Directory -Force -Path $dstVendor  | Out-Null
New-Item -ItemType Directory -Force -Path $dstPrivate | Out-Null

Step 'Copying vendor/ to public_html/vendor/ (source stays in place)'
robocopy $srcVendor $dstVendor /E /COPY:DAT /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Step 'Copying private/email-config.php to public_html/private/ (not printed)'
Copy-Item -LiteralPath $srcConfig -Destination $dstConfig -Force

$htaccess = @'
# Deny all direct HTTP access to this directory.
# PHP can still read these files from disk (this is how the endpoints load them).
<IfModule mod_authz_core.c>
    Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
</IfModule>
'@

foreach ($dir in @($dstVendor, $dstPrivate)) {
    $file = Join-Path $dir '.htaccess'
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        Set-Content -LiteralPath $file -Value $htaccess -Encoding ASCII
        Step "Created $file"
    } else {
        Step "Kept existing $file"
    }
}

foreach ($required in @(
    (Join-Path $dstVendor 'autoload.php'),
    (Join-Path $dstVendor 'phpmailer\phpmailer\src\PHPMailer.php'),
    $dstConfig,
    (Join-Path $dstVendor '.htaccess'),
    (Join-Path $dstPrivate '.htaccess')
)) {
    if (Test-Path -LiteralPath $required -PathType Leaf) {
        Step "OK  $required"
    } else {
        $failures.Add("Missing: $required")
    }
}

$php = Get-Command php -ErrorAction SilentlyContinue
if ($php) {
    $syntaxTargets = @(
        (Join-Path $root 'public_html\send-email.php'),
        (Join-Path $root 'public_html\send-custom-trip.php'),
        (Join-Path $root 'public_html\generate-csrf-token.php')
    )
    foreach ($file in $syntaxTargets) {
        & $php.Source -l $file
        if ($LASTEXITCODE -ne 0) { $failures.Add("Syntax error: $file") }
    }

    & $php.Source (Join-Path $PSScriptRoot 'verify-mail-setup.php')
    if ($LASTEXITCODE -ne 0) { $failures.Add('Runtime verification reported FAIL (see output above)') }
} else {
    Write-Warning 'PHP CLI not found: syntax and runtime verification were skipped.'
}

if ($failures.Count -gt 0) {
    foreach ($item in $failures) { Write-Host "FAIL  $item" -ForegroundColor Red }
    exit 1
}

Write-Host 'All preparation checks passed.' -ForegroundColor Green
exit 0
