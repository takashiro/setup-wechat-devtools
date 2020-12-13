#!/usr/bin/env pwsh

$curDir=$(Get-Location).Path

cd "C:\Program Files (x86)\Tencent\微信web开发者工具"

.\node.exe .\cli.js $args

cd "$curDir"
