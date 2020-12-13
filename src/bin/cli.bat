@echo off

set CALLING_DIR=%CD%

cd /d "C:\Program Files (x86)\Tencent\微信web开发者工具"

.\node.exe .\cli.js %*

cd "%CALLING_DIR%"
