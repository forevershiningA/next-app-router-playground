@echo off
call ant -f build-all.xml
IF NOT "%errorlevel%"=="0" GOTO ERROR
exit /b 0
:ERROR
echo.
pause
exit /b %errorlevel%