@echo off
cd /d "%~dp0"
python tools/build_dashboard.py
if errorlevel 1 (
  echo.
  echo Ошибка сборки дашборда.
  pause
  exit /b 1
)
echo.
echo Готово. Открываю portfolio-dashboard.html ...
start "" "%~dp0management\portfolio-dashboard.html"
pause
