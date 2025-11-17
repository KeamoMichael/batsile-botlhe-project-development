# Navigate to project directory
$projectPath = "\\Mac\Home\Documents\Web Development\batsile-botlhe-project-development"
Set-Location $projectPath

# Add the modified file
git add styles.css

# Commit with descriptive message
git commit -m "Update service card hover transitions to match reference website exactly

- Changed service-card transition from 'all var(--transition-base)' to 'all'
- Changed service-image img transition from 'transform var(--transition-slow)' to 'all'
- Changed service-content transition from 'all 0.4s cubic-bezier(...)' to 'all'
- All transitions now match the reference website (batsilebotlhe.co.za) exactly"

# Push to GitHub
git push origin main

Write-Host "Changes committed and pushed successfully!"

