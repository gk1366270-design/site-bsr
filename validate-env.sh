#!/bin/bash

# Script de Validação de Variáveis de Ambiente para Discloud
# Execute antes de fazer deploy: bash validate-env.sh

echo "🔍 Validando configuração de variáveis de ambiente..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis que devem estar configuradas
REQUIRED_VARS=(
  "NODE_ENV"
  "STEAM_API_KEY"
  "SESSION_SECRET"
  "FRONTEND_URL"
  "STEAM_RETURN_URL"
  "STEAM_REALM"
)

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "DESENVOLVIMENTO (arquivo .env)"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f .env ]; then
  echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
  echo ""
  for var in "${REQUIRED_VARS[@]}"; do
    VALUE=$(grep "^$var=" .env | cut -d'=' -f2)
    if [ -z "$VALUE" ]; then
      echo -e "${YELLOW}⚠️  $var não definida em .env${NC}"
    else
      if [ "$var" = "STEAM_API_KEY" ] || [ "$var" = "SESSION_SECRET" ]; then
        echo -e "${GREEN}✓ $var = ${VALUE:0:10}...${NC}"
      else
        echo -e "${GREEN}✓ $var = $VALUE${NC}"
      fi
    fi
  done
else
  echo -e "${RED}✗ Arquivo .env NÃO encontrado${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "PRODUÇÃO (Discloud - variáveis do painel)"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}ℹ️  Em Produção (Discloud), você deve configurar:${NC}"
echo ""

for var in "${REQUIRED_VARS[@]}"; do
  echo "   📋 $var"
done

echo ""
echo -e "${YELLOW}Como configurar:${NC}"
echo "   1. Acesse https://discloud.app"
echo "   2. Clique em sua aplicação (Brasil Sim Racing)"
echo "   3. Vá em Configurações → Variáveis de Ambiente"
echo "   4. Configure cada variável"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "IMPORTANTE - VARIÁVEIS CRÍTICAS"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar se os valores default foram mudados
if grep -q "your-secure-session-secret-change-this" .env.production 2>/dev/null; then
  echo -e "${RED}❌ SESSION_SECRET ainda tem valor default!${NC}"
  echo "   Deve ser uma string aleatória segura"
  echo ""
fi

if grep -q "your-steam-api-key-here" .env.production 2>/dev/null; then
  echo -e "${RED}❌ STEAM_API_KEY ainda tem valor default!${NC}"
  echo "   Deve ser sua chave Steam API real"
  echo ""
fi

echo -e "${GREEN}📚 Leia QUICK_START.md para configurar variáveis no Discloud${NC}"
echo ""

# Checklist final
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "CHECKLIST PRÉ-DEPLOY"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

READY=true

if [ -z "$(grep 'STEAM_API_KEY=' .env)" ]; then
  echo -e "${RED}❌ STEAM_API_KEY não configurada em .env (desenvolvimento)${NC}"
  READY=false
fi

if [ -z "$(grep 'SESSION_SECRET=' .env)" ]; then
  echo -e "${RED}❌ SESSION_SECRET não configurada em .env (desenvolvimento)${NC}"
  READY=false
fi

if grep -q "your-steam-api-key-here" .env.production 2>/dev/null || grep -q "your-secure-session-secret" .env.production 2>/dev/null; then
  echo -e "${RED}❌ Variáveis default ainda estão em .env.production${NC}"
  READY=false
fi

if [ "$READY" = true ]; then
  echo -e "${GREEN}✅ Todas as variáveis parecem estar configuradas!${NC}"
  echo ""
  echo -e "${GREEN}Próximos passos:${NC}"
  echo "   1. git add ."
  echo "   2. git commit -m 'Update: Variáveis de ambiente validadas'"
  echo "   3. git push origin main"
  echo "   4. No painel Discloud, clique em Redeploy"
  echo ""
else
  echo ""
  echo -e "${YELLOW}⚠️  Corrija os problemas acima antes de fazer deploy!${NC}"
fi
