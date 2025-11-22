@echo off
title UNIVET - Inicializador Full Stack

echo ================================
echo      Inicializando Backend
echo ================================

REM --- abre nova janela para o backend ---
start cmd /k "cd /d E:\Faculdade\2025\Final\univet_app\backend && venv\Scripts\activate && set FLASK_APP=app:create_app && set FLASK_ENV=development && flask run --host=0.0.0.0 --port=5000"

echo.
echo ================================
echo      Inicializando Frontend
echo ================================

REM --- abre nova janela para o frontend ---
start cmd /k "cd /d E:\Faculdade\2025\Final\univet_app\frontend && npm run dev -- --host 0.0.0.0 --port 8080"

echo.
echo ================================
echo  Tudo iniciado! Pode usar o UNIVET
echo ================================

pause
