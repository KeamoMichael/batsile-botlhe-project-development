# Navigate to project directory
$projectPath = "\\Mac\Home\Documents\batsile-botlhe-project-development"
Set-Location $projectPath

# Configure git safe directory to avoid ownership issues
git config --global --add safe.directory $projectPath

# Initialize git if not already initialized
if (-not (Test-Path .git)) {
    git init
}

# Add remote if not exists
$remoteExists = git remote | Select-String -Pattern "origin"
if (-not $remoteExists) {
    git remote add origin https://github.com/KeamoMichael/batsile-botlhe-project-development.git
} else {
    git remote set-url origin https://github.com/KeamoMichael/batsile-botlhe-project-development.git
}

# Add all files
git add .

# Commit with descriptive message
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Update project files - $timestamp"
if ($args.Count -gt 0) {
    $commitMessage = $args[0]
}
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push origin main

Write-Host "Changes committed and pushed successfully!"

