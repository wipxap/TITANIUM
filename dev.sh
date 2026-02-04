#!/bin/bash
# TITANIUM - Desarrollo Local
# Inicia backend (Workers) y frontend (Vite) en paralelo

set -e

# Obtener directorio del script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}🔥 TITANIUM DEV${NC}"
echo "Iniciando entorno de desarrollo local..."

# Matar procesos previos en los puertos
lsof -ti:8787 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

sleep 1

# Iniciar backend en background
echo -e "${GREEN}▶ Backend:${NC} http://localhost:8787"
cd "$DIR/workers" && npm run dev > /dev/null 2>&1 &
BACKEND_PID=$!

sleep 3

# Iniciar frontend en background
echo -e "${GREEN}▶ Frontend:${NC} http://localhost:5173"
cd "$DIR" && npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

sleep 2

echo ""
echo -e "${GREEN}✓ Desarrollo local activo${NC}"
echo "  Backend:  http://localhost:8787"
echo "  Frontend: http://localhost:5173"
echo ""
echo "PIDs: Backend=$BACKEND_PID Frontend=$FRONTEND_PID"
echo "Para detener: kill $BACKEND_PID $FRONTEND_PID"
