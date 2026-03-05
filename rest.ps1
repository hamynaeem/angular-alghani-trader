# === CONFIGURATION ===
$TargetPath = "C:\Path\To\Folder"  # Change this to your folder path
$LogFile = "$TargetPath\PermissionResetLog.txt"

# === START LOGGING ===
Add-Content -Path $LogFile -Value "`n=== Permission Reset Started: $(Get-Date) ==="

# === TAKE OWNERSHIP ===
try {
    takeown /f $TargetPath /r /d y | Out-File -Append $LogFile
    Add-Content -Path $LogFile -Value "Ownership taken successfully."
} catch {
    Add-Content -Path $LogFile -Value "Error taking ownership: $_"
}

# === RESET PERMISSIONS ===
try {
    icacls $TargetPath /reset /t | Out-File -Append $LogFile
    icacls $TargetPath /grant administrators:F /t | Out-File -Append $LogFile
    Add-Content -Path $LogFile -Value "Permissions reset and full control granted to administrators."
} catch {
    Add-Content -Path $LogFile -Value "Error resetting permissions: $_"
}

# === END LOGGING ===
Add-Content -Path $LogFile -Value "=== Permission Reset Completed: $(Get-Date) ===`n"
