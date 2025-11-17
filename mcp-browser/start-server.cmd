@echo off
REM Batch wrapper script for MCP Browser Server
REM This ensures reliable execution from UNC paths on Windows

cd /d "%~dp0"
node index.js

