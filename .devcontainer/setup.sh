#!/usr/bin/env bash
set -e

echo "Configurando ambiente do projeto..."

if [ -f backend/package.json ]; then
  echo "Instalando dependências do backend..."
  cd backend
  npm install
  cd ..
fi

if [ -f frontend/package.json ]; then
  echo "Instalando dependências do frontend..."
  cd frontend
  npm install
  cd ..
fi

echo "Ambiente pronto."