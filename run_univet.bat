@echo off
title UNIVET - Inicializador Full Stack

echo ================================
echo      Inicializando Backend
echo ================================

REM --- abre nova janela para o backend ---
start cmd /k "cd /d E:\Faculdade\2025\Final\univet_app\backend && venv\Scripts\activate && set FLASK_APP=app:create_app && set FLASK_ENV=development && flask run"

echo.
echo ================================
echo      Inicializando Frontend
echo ================================

REM --- abre nova janela para o frontend ---
start cmd /k "cd /d E:\Faculdade\2025\Final\univet_app\frontend && npm run dev"

echo.
echo ================================
echo  Tudo iniciado! Pode usar o UNIVET
echo ================================

pause