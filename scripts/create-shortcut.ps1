$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Mafogh Editor.lnk"
$scriptDir = Split-Path -Parent $PSScriptRoot
$vbsPath = Join-Path $scriptDir "Mafogh-Editor.vbs"

$s = $ws.CreateShortcut($shortcutPath)
$s.TargetPath = $vbsPath
$s.WorkingDirectory = $scriptDir
$s.Description = "Mafogh Video Editor - تدوینگر مافوق"

if (Test-Path "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe") {
    $s.IconLocation = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe,0"
} elseif (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    $s.IconLocation = "C:\Program Files\Google\Chrome\Application\chrome.exe,0"
}

$s.Save()

Write-Host "========================================================" -ForegroundColor Green
Write-Host "  میانبر «Mafogh Editor» با موفقیت روی دسکتاپ ایجاد شد!" -ForegroundColor Yellow
Write-Host "  مسیر: $shortcutPath" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
