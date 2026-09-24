@echo off
REM Lanzador de BOTELLAPP para desarrollo local en Windows.
REM Uso: haz doble clic (o crea un acceso directo en el Escritorio a este archivo).
REM Deja abierta la ventana "BOTELLAPP - Servidor" mientras uses el sistema.

cd /d "%~dp0"

if not exist "node_modules" (
    echo No se encontraron las dependencias instaladas.
    echo Ejecuta primero: npm install
    pause
    exit /b 1
)

if not exist "dev.db" (
    echo No se encontro la base de datos local ^(dev.db^).
    echo Ejecuta primero: npm run db:push  y luego  npm run seed
    pause
    exit /b 1
)

echo Iniciando BOTELLAPP...
start "BOTELLAPP - Servidor (no cierres esta ventana)" cmd /k "npm run dev"

echo Esperando a que el servidor arranque...
timeout /t 6 /nobreak >nul

start "" "http://localhost:3000/login/rincon-patrimonial"

exit
