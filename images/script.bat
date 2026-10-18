@echo off
setlocal enabledelayedexpansion
set /a count=0

for /f "delims=" %%a in ('dir /b /a-d /o:n') do (
    if not "%%a"=="%~nx0" (
        rename "%%a" "!count!%%~xa"
        set /a count+=1
    )
)
