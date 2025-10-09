#!/bin/bash

echo "🧪 Testando Sistema de Votação..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
    fi
}

echo "📍 Testando disponibilidade dos endpoints..."
echo ""

# Testa páginas públicas
test_endpoint "GET" "/" "Homepage"
test_endpoint "GET" "/register" "Página de inscrição"
test_endpoint "GET" "/admin/login" "Página de login admin"

echo ""
echo "🔌 Testando API endpoints..."
echo ""

# Testa API
test_endpoint "GET" "/api/votings" "Listar votações"

echo ""
echo "🐳 Verificando containers Docker..."
echo ""

# Verifica containers
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓${NC} Containers estão rodando"
    docker-compose ps
else
    echo -e "${RED}✗${NC} Containers não estão rodando"
    echo "Execute: docker-compose up -d"
fi

echo ""
echo "📊 Status do MongoDB..."
echo ""

# Verifica MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB está acessível"
else
    echo -e "${RED}✗${NC} MongoDB não está acessível"
fi

echo ""
echo "📁 Verificando diretórios de upload..."
echo ""

if [ -d "public/uploads/photos" ]; then
    echo -e "${GREEN}✓${NC} Diretório de fotos existe"
else
    echo -e "${YELLOW}⚠${NC} Diretório de fotos não existe"
    echo "  Criando..."
    mkdir -p public/uploads/photos
fi

if [ -d "public/uploads/music" ]; then
    echo -e "${GREEN}✓${NC} Diretório de músicas existe"
else
    echo -e "${YELLOW}⚠${NC} Diretório de músicas não existe"
    echo "  Criando..."
    mkdir -p public/uploads/music
fi

echo ""
echo "🔐 Verificando arquivo .env..."
echo ""

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Arquivo .env existe"
else
    echo -e "${YELLOW}⚠${NC} Arquivo .env não existe"
    echo "  Criando a partir do .env.example..."
    cp .env.example .env
fi

echo ""
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo "📖 Próximos passos:"
echo "   1. Acesse http://localhost:3000"
echo "   2. Faça login em http://localhost:3000/admin/login"
echo "   3. Use as credenciais: admin / admin123"
echo ""
