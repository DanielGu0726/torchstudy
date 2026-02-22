@echo off
chcp 65001 > nul
cd /d "%~dp0"

set /p msg="commit message: "

git add .
git commit -m "%msg%"
git push

echo.
echo Push complete!
pause
