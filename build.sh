#!/bin/sh
mkdir release
rm -rf release/*.zip
# Client
cp ./build/libs/*jar ./release
cd release
mkdir al
cd al
unzip ../AsieLauncher-latest.jar
rm ../AsieLauncher-latest.jar
cp ../../libraries/json* ./
cp ../../libraries/lzma* ./
rm -rf resources
zip -0 -r ../AsieLauncher-latest.jar .
cd ..
rm -rf al
cd ..
# Server
cd server/AsieLauncher/internal
zip -9 -r ../../../release/AsieLauncher-latest-server.zip *.js mod*.json
cd ../..
zip -9 -r ../release/AsieLauncher-latest-server.zip package.json
# Bootstrap
rm -rf AsieLauncher/internal/launcher/*
rm -rf AsieLauncher/temp/*
mv AsieLauncher/internal/info.json temp-info.json
zip -9 -r ../release/AsieLauncher-latest-bootstrap.zip AsieLauncher also-config.json package.json also.js
mv temp-info.json AsieLauncher/internal/info.json
cd ..
zip -9 -r release/AsieLauncher-latest-bootstrap.zip docs changelog.txt
