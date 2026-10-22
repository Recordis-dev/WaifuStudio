<#
.SYNOPSIS
    Actualizador automatico de WaifuStudio para instalaciones hechas con Git.

.DESCRIPTION
    Detiene app/engine, guarda un backup de data\ y ComfyUI\user\, hace
    git pull --ff-only y vuelve a ejecutar install\install.ps1. Por defecto
    no descarga modelos nuevos; usa -InstallModels para eso.

    No actualiza instalaciones ZIP: en ese caso hay que descargar la version
    nueva en una carpeta aparte y copiar data\ y ComfyUI\user\.

.PARAMETER Root
    Raiz del repo. Por defecto, el directorio padre de install\.
.PARAMETER Remote
    Remoto Git. Por defecto origin.
.PARAMETER Branch
    Rama a actualizar. Por defecto main.
.PARAMETER NoBackup
    No copia data\ ni ComfyUI\user\ antes de actualizar.
.PARAMETER NoStart
    No arranca la app al terminar.
.PARAMETER SkipInstall
    Solo hace el pull; no ejecuta install\install.ps1.
.PARAMETER InstallModels
    Ejecuta el instalador con -Yes y descarga los modelos que falten.
.PARAMETER ForceInstall
    Ejecuta install\install.ps1 aunque el commit no haya cambiado.
.PARAMETER DryRun
    Muestra lo que haria, sin detener, copiar, hacer pull ni instalar.
#>
[CmdletBinding()]
param(
    [string]$Root = '',
    [string]$Remote = 'origin',
    [string]$Branch = 'main',
    [switch]$NoBackup,
    [switch]$NoStart,
    [switch]$SkipInstall,
    [switch]$InstallModels,
    [switch]$ForceInstall,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
$Root = [System.IO.Path]::GetFullPath($Root)

function Write-Step {
    param([string]$Message)
    Write-Host ("==> {0}" -f $Message) -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host ("    OK  {0}" -f $Message) -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host ("    AVISO  {0}" -f $Message) -ForegroundColor Yellow
}

function Invoke-Git {
    param([string[]]$Arguments)
    $output = & git -C $Root @Arguments 2>&1
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        throw ("git {0} fallo (exit {1}):`n{2}" -f ($Arguments -join ' '), $code, ($output -join "`n"))
    }
    return $output
}

function Stop-WaifuProcesses {
    foreach ($name in @('stop_app.ps1', 'stop_llm.ps1', 'stop_engine.ps1')) {
        $script = Join-Path $Root ("scripts\{0}" -f $name)
        if (-not (Test-Path -LiteralPath $script)) { continue }
        Write-Step ("deteniendo {0}" -f $name)
        & $script
        if ($LASTEXITCODE -ne 0) {
            throw ("{0} fallo (exit {1})" -f $name, $LASTEXITCODE)
        }
    }
}

function Copy-Backup {
    param([string]$BackupPath)
    New-Item -ItemType Directory -Force -Path $BackupPath | Out-Null

    foreach ($relative in @('data', 'ComfyUI\user')) {
        $source = Join-Path $Root $relative
        if (-not (Test-Path -LiteralPath $source)) { continue }
        $destination = Join-Path $BackupPath $relative
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
        Write-Step ("copiando {0}" -f $relative)
        & robocopy $source $destination /E /R:2 /W:2 /NFL /NDL /NJH /NJS /NP | Out-Null
        if ($LASTEXITCODE -ge 8) {
            throw ("robocopy fallo al copiar {0} (exit {1})" -f $relative, $LASTEXITCODE)
        }
    }

    foreach ($file in @('.env', 'config.local.json')) {
        $source = Join-Path $Root $file
        if (Test-Path -LiteralPath $source) {
            Copy-Item -LiteralPath $source -Destination (Join-Path $BackupPath $file) -Force
        }
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $Root 'install\install.ps1'))) {
    throw ("No encuentro install\install.ps1 en {0}" -f $Root)
}

$inside = & git -C $Root rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or "$inside".Trim() -ne 'true') {
    throw 'Esta carpeta no es un repo Git. update.bat solo actualiza instalaciones clonadas con Git; para una instalacion ZIP hay que usar una carpeta nueva y copiar data\ y ComfyUI\user\.'
}

$currentBranch = (& git -C $Root rev-parse --abbrev-ref HEAD).Trim()
$dirty = @(& git -C $Root status --porcelain --untracked-files=no)
if ($dirty.Count -gt 0) {
    throw ("Hay cambios locales en archivos versionados:`n{0}`nGuarda o descarta esos cambios antes de actualizar." -f ($dirty -join "`n"))
}

if ($currentBranch -eq 'HEAD') {
    if ($DryRun) {
        Write-Step ("dry-run: haria git checkout {0}" -f $Branch)
    } else {
        Write-Step ("checkout {0} (la instalacion estaba en un tag)" -f $Branch)
        Invoke-Git @('checkout', $Branch) | Out-Null
        $currentBranch = $Branch
    }
}
if ($currentBranch -ne $Branch) {
    throw ("Estas en la rama '{0}', no en '{1}'. Cambia de rama o usa -Branch." -f $currentBranch, $Branch)
}

Write-Host ("Raiz: {0}" -f $Root)
Write-Host ("Remoto: {0}/{1}" -f $Remote, $Branch)

if ($DryRun) {
    Write-Host 'Dry-run: no se detiene la app, no se copia nada, no se hace pull y no se instala.' -ForegroundColor Yellow
    Write-Host 'El repo esta limpio y la rama es correcta. Se puede ejecutar sin -DryRun.'
    exit 0
}

Stop-WaifuProcesses
Start-Sleep -Seconds 2

$before = (& git -C $Root rev-parse HEAD).Trim()
$backupPath = $null
if (-not $NoBackup) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $base = if ($env:LOCALAPPDATA) {
        Join-Path $env:LOCALAPPDATA 'WaifuStudio\backups'
    } else {
        Join-Path (Split-Path -Parent $Root) 'WaifuStudio-backups'
    }
    $backupPath = Join-Path $base ("update-{0}" -f $stamp)
    Write-Step ("backup en {0}" -f $backupPath)
    Copy-Backup -BackupPath $backupPath
    $info = @(
        ("fecha: {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')),
        ("commit_anterior: {0}" -f $before),
        ("raiz: {0}" -f $Root)
    ) -join "`r`n"
    Set-Content -LiteralPath (Join-Path $backupPath 'update-info.txt') -Value $info -Encoding UTF8
    Write-Ok 'backup terminado'
}

Write-Step ("git fetch {0}" -f $Remote)
Invoke-Git @('fetch', '--tags', '--prune', $Remote) | Out-Null
Write-Step ("git pull --ff-only {0} {1}" -f $Remote, $Branch)
$pullOutput = Invoke-Git @('pull', '--ff-only', $Remote, $Branch)
$pullOutput | ForEach-Object { Write-Host ("    {0}" -f $_) }

$after = (& git -C $Root rev-parse HEAD).Trim()
$changed = $before -ne $after

if (-not $changed -and -not $ForceInstall) {
    Write-Ok 'ya estaba en la ultima version; no hace falta reinstalar'
} elseif (-not $SkipInstall) {
    Write-Step 'reinstalando dependencias y verificando la instalacion'
    $installArgs = @('-Root', $Root, '-SkipModels')
    if ($InstallModels) {
        $installArgs = @('-Root', $Root, '-Yes')
        Write-Warn 'se descargaran los modelos que falten'
    } else {
        Write-Warn 'no se descargan modelos nuevos; usa -InstallModels si hace falta'
    }
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root 'install\install.ps1') @installArgs
    if ($LASTEXITCODE -ne 0) {
        throw ("install.ps1 fallo (exit {0}). Backup: {1}" -f $LASTEXITCODE, $backupPath)
    }
} else {
    Write-Warn 'se omite install.ps1 por -SkipInstall'
}

if (-not $NoStart) {
    Write-Step 'arrancando WaifuStudio'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root 'scripts\open_window.ps1')
    if ($LASTEXITCODE -ne 0) {
        Write-Warn 'la app no arranco automaticamente; ejecuta start.bat'
    }
}

Write-Host ''
Write-Ok 'actualizacion terminada'
if ($backupPath) { Write-Host ("Backup: {0}" -f $backupPath) }
Write-Host ("Commit anterior: {0}" -f $before)
Write-Host ("Commit actual:   {0}" -f $after)
exit 0
