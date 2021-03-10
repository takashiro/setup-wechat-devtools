#!/bin/bash

cwd=$(pwd)
cd '/Applications/wechatwebdevtools.app/Contents/MacOS/'
'../Frameworks/nwjs Framework.framework/Helpers/wechatwebdevtools Helper (Renderer).app/Contents/MacOS/node' ./cli.js "$@"
cd "$cwd"
