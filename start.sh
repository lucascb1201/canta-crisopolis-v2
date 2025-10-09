#!/bin/bash

echo "🚀 Inicializando Sistema de Votação..."
echo ""

# Criar diretórios de upload
echo "📁 Criando diretórios de upload..."
mkdir -p public/uploads/photos
mkdir -p public/uploads/music
echo "✅ Diretórios criados!"
echo ""

# Copiar .env.example para .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações!"
else
    echo "ℹ️  Arquivo .env já existe"
fi
echo ""

# Subir containers
echo "🐳 Iniciando containers Docker..."
docker compose up -d
echo ""

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem (30 segundos)..."
sleep 30
echo ""

# Criar usuário admin
echo "👤 Criando usuário administrador..."
docker compose exec -T nextjs npm run seed
echo ""

echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "📍 Acessos:"
echo "   - Página Principal: http://localhost:3000"
echo "   - Login Admin: http://localhost:3000/admin/login"
echo "   - Inscrição: http://localhost:3000/register"
echo ""
echo "🔑 Credenciais Admin:"
echo "   - Usuário: admin"
echo "   - Senha: admin123"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha após o primeiro login!"
echo ""
echo "🎤 Boa sorte no seu concurso! 🎵"
