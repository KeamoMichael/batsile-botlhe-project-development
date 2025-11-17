@echo off
cd /d "%~dp0"
echo Initializing git repository...
git init
echo.
echo Adding remote repository...
git remote add origin https://github.com/KeamoMichael/batsile-botlhe-project-development.git 2>nul
if errorlevel 1 (
    git remote set-url origin https://github.com/KeamoMichael/batsile-botlhe-project-development.git
)
echo.
echo Adding all files...
git add .
echo.
echo Committing files...
git commit -m "Initial commit"
echo.
echo Setting branch to main...
git branch -M main
echo.
echo Pushing to GitHub...
echo Please make sure you have authenticated with GitHub (personal access token or SSH key)
git push -u origin main
echo.
echo Done!
pause

