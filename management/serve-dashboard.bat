@echo off
chcp 65001 >nul
cd /d "%~dp0.."

set PORT=8765

echo.
echo ============================================
echo   Портфель Яндекс Игры — LAN сервер
echo ============================================
echo.
echo   Корень раздачи: репозиторий (чтобы отдавались games/*/docs и refs)
echo.

REM Local IPv4 (first non-loopback)
set IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do (
    set IP=%%b
    goto :got_ip
  )
)
:got_ip
if "%IP%"=="" set IP=127.0.0.1

echo   На этом ПК:     http://127.0.0.1:%PORT%/management/portfolio-dashboard.html
echo   С телефона:     http://%IP%:%PORT%/management/portfolio-dashboard.html
echo   Проект:         http://127.0.0.1:%PORT%/management/projects/deadline-escape.html
echo.
echo   Телефон и ПК должны быть в одной Wi-Fi сети.
echo   Если не открывается — разреши Python в брандмауэре Windows.
echo.
echo   Остановка: Ctrl+C
echo ============================================
echo.

python -m http.server %PORT% --bind 0.0.0.0
if errorlevel 1 (
  echo.
  echo Не удалось запустить сервер. Проверь, что Python установлен.
  pause
)
