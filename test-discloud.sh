#!/bin/bash

# Script de teste para verificar compatibilidade com Discloud
# Execute com: bash test-discloud.sh

echo "==================================="
echo "Teste de Compatibilidade - Discloud"
echo "==================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}[1] Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} encontrado${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado!${NC}"
    exit 1
fi

echo ""

# 2. Verificar npm
echo -e "${YELLOW}[2] Verificando npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm ${NPM_VERSION} encontrado${NC}"
else
    echo -e "${RED}✗ npm não encontrado!${NC}"
    exit 1
fi

echo ""

# 3. Instalar dependências
echo -e "${YELLOW}[3] Instalando dependências...${NC}"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao instalar dependências${NC}"
    exit 1
fi

echo ""

# 4. Build
echo -e "${YELLOW}[4] Fazendo build do projeto...${NC}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build completado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao fazer build${NC}"
    exit 1
fi

echo ""

# 5. Verificar dist
echo -e "${YELLOW}[5] Verificando pasta dist...${NC}"
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓ Pasta dist gerada corretamente${NC}"
    echo "   Arquivos em dist:"
    ls -la dist | head -10
else
    echo -e "${RED}✗ Pasta dist ou index.html não encontrados${NC}"
    exit 1
fi

echo ""

# 6. Verificar .env
echo -e "${YELLOW}[6] Verificando variáveis de ambiente...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
    echo "   Variáveis configuradas:"
    grep "^[^#]" .env | head -5
else
    echo -e "${RED}✗ Arquivo .env não encontrado${NC}"
fi

echo ""

# 7. Verificar server.js
echo -e "${YELLOW}[7] Verificando server.js...${NC}"
if [ -f "server.js" ]; then
    echo -e "${GREEN}✓ server.js encontrado${NC}"
    if grep -q "app.listen" server.js; then
        echo -e "${GREEN}✓ Servidor Express configurado${NC}"
    fi
else
    echo -e "${RED}✗ server.js não encontrado${NC}"
fi

echo ""

# 8. Verificar discloud.config
echo -e "${YELLOW}[8] Verificando discloud.config...${NC}"
if [ -f "discloud.config" ]; then
    echo -e "${GREEN}✓ discloud.config encontrado${NC}"
    echo "   Configuração:"
    cat discloud.config
else
    echo -e "${RED}✗ discloud.config não encontrado${NC}"
fi

echo ""

# Resumo
echo "==================================="
echo -e "${GREEN}✓ Testes completados!${NC}"
echo "==================================="
echo ""
echo "Próximos passos:"
echo "1. Faça commit de suas mudanças:"
echo "   git add ."
echo "   git commit -m 'Fix: Compatibilidade com Discloud'"
echo ""
echo "2. Faça push para o repositório:"
echo "   git push origin main"
echo ""
echo "3. No painel do Discloud:"
echo "   - Acesse https://discloud.app"
echo "   - Vá até 'Aplicações'"
echo "   - Clique em 'Redeploy'"
echo "   - Aguarde a conclusão do deploy"
echo ""
echo "4. Teste a aplicação em https://brasilsimracing.discloud.app"
