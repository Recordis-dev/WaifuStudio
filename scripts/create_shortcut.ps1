param(
    [string]$Root = '',
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
    $Root = Split-Path -Parent $PSScriptRoot
}
$Root = (Resolve-Path -LiteralPath $Root).Path

$target = Join-Path $Root 'start.bat'
$icon = Join-Path $Root 'static\favicon.ico'
$shortcutPath = Join-Path $Root 'WAIFUSTUDIO.lnk'

foreach ($required in @($target, $icon)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "No se encontro el archivo requerido: $required"
    }
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = $Root
$shortcut.IconLocation = "$icon,0"
$shortcut.Description = 'WaifuStudio'
$shortcut.WindowStyle = 1
$shortcut.Save()

if (-not $Quiet) {
    Write-Host "Acceso directo creado: $shortcutPath" -ForegroundColor Green
    Write-Host "Icono: $icon" -ForegroundColor Green
}
