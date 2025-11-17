# Navigate to project directory
$projectPath = "\\Mac\Home\Documents\Web Development\batsile-botlhe-project-development"
Set-Location $projectPath

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
$commitMessage = "Update MCP browser and add commit scripts"
if ($args.Count -gt 0) {
    $commitMessage = $args[0]
}
git commit -m $commitMessage

# Push to GitHub
git push origin main

