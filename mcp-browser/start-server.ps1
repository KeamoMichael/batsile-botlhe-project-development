# PowerShell wrapper script for MCP Browser Server
# This script ensures reliable execution from UNC paths on Windows

$ErrorActionPreference = "Stop"

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $scriptDir "index.js"

# Change to the script directory to ensure relative paths work
Set-Location $scriptDir

# Execute the Node.js server
& node $serverScript

