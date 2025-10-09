# Sistema de Votação - Concurso de Cantores 🎤

Sistema completo de votação para concurso de cantores, desenvolvido com Next.js 14, MongoDB e Docker.

## 🚀 Funcionalidades

### Para o Público

- ✅ Visualizar votações disponíveis
- ✅ Votar em candidatos (uma vez por dispositivo por votação)
- ✅ Ouvir músicas dos candidatos
- ✅ Ver resultados (quando habilitado)
- ✅ Inscrever-se como candidato

### Para Administradores

- ✅ Criar e editar votações
- ✅ Upload de fotos e músicas para cada candidato
- ✅ Controlar visibilidade das votações
- ✅ Abrir/fechar votações
- ✅ Mostrar/ocultar resultados
- ✅ Excluir votações

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (SSR)
- **Banco de Dados**: MongoDB
- **Autenticação**: JWT com cookies HTTP-only
- **Identificação de Dispositivo**: FingerprintJS
- **Upload de Arquivos**: File System API
- **Containerização**: Docker & Docker Compose

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)

## 🚀 Como Executar

### Com Docker (Recomendado)

1. Clone o repositório:

```bash
git clone <seu-repositorio>
cd voting
```

2. Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

3. Inicie os containers:

```bash
docker-compose up -d
```

4. Aguarde os containers iniciarem e acesse:

```bash
# Aplicação
http://localhost:3000

# MongoDB (opcional - para debug)
mongodb://admin:voting_password_2025@localhost:27017
```

5. Crie o usuário administrador:

```bash
docker-compose exec nextjs npx ts-node scripts/seed.ts
```

Credenciais padrão:

- **Usuário**: admin
- **Senha**: admin123
- **Email**: admin@voting.com

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

### Desenvolvimento Local (Sem Docker)

1. Instale as dependências:

```bash
npm install
```

2. Configure o MongoDB localmente ou use um serviço na nuvem

3. Configure o arquivo `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/voting
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Crie o usuário administrador:

```bash
npx ts-node scripts/seed.ts
```

## 📱 Uso do Sistema

### Acesso Público

1. Acesse `http://localhost:3000`
2. Visualize as votações disponíveis
3. Clique em um candidato para selecioná-lo
4. Clique em "Ouvir" para reproduzir a música
5. Clique em "Confirmar Voto" para registrar seu voto

### Inscrição de Candidatos

1. Acesse `http://localhost:3000/register`
2. Preencha o formulário com seus dados
3. Envie a inscrição

### Painel Administrativo

1. Acesse `http://localhost:3000/admin/login`
2. Faça login com as credenciais
3. No painel, você pode:
   - Criar nova votação
   - Editar votações existentes
   - Alternar visibilidade
   - Abrir/fechar votações
   - Mostrar/ocultar resultados
   - Excluir votações

## 🔒 Segurança

- **Prevenção de Votos Duplicados**: Sistema de fingerprinting de dispositivo usando FingerprintJS
- **Autenticação Admin**: JWT armazenado em cookies HTTP-only
- **Validação de Dados**: Validação no cliente e servidor
- **Proteção de Rotas**: Middleware de autenticação

## 📁 Estrutura do Projeto

```
voting/
├── docker-compose.yml          # Configuração Docker
├── Dockerfile                  # Imagem Docker do Next.js
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── votings/       # Votações
│   │   │   └── candidates/    # Candidatos
│   │   ├── admin/             # Painel administrativo
│   │   ├── register/          # Página de inscrição
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Página principal
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   ├── contexts/              # Context API (Auth)
│   ├── hooks/                 # Custom Hooks
│   ├── lib/                   # Utilitários
│   │   ├── mongodb.ts         # Conexão MongoDB
│   │   ├── jwt.ts             # Geração/verificação JWT
│   │   ├── auth.ts            # Middleware de auth
│   │   ├── fingerprint.ts     # Device fingerprinting
│   │   └── upload.ts          # Upload de arquivos
│   └── models/                # Modelos Mongoose
│       ├── Admin.ts
│       ├── Voting.ts
│       ├── Vote.ts
│       └── Candidate.ts
├── scripts/
│   └── seed.ts                # Script de seed do banco
└── public/
    └── uploads/               # Arquivos uploadados
        ├── photos/
        └── music/
```

## 🎨 Design

O sistema possui um design moderno com tema musical:

- Gradientes roxo/azul remetendo a palcos e shows
- Animações suaves e fluidas
- Interface responsiva (mobile-first)
- Ícones musicais em toda a aplicação
- Cards elegantes para candidatos
- Player de música integrado

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```env
# MongoDB
MONGODB_URI=mongodb://user:password@host:port/database

# JWT Secret (use um valor seguro em produção)
JWT_SECRET=your-secret-key-minimum-32-characters

# URL da aplicação
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Limites de Upload

Ajuste no `next.config.js`:

```javascript
serverActions: {
  bodySizeLimit: '10mb', // Ajuste conforme necessário
}
```

## 🐛 Troubleshooting

### Erro de conexão com MongoDB

```bash
# Verifique se o container está rodando
docker-compose ps

# Veja os logs
docker-compose logs mongodb
```

### Erro ao fazer upload de arquivos

```bash
# Crie os diretórios manualmente
mkdir -p public/uploads/photos
mkdir -p public/uploads/music
```

### Problemas com fingerprint

- Certifique-se de que o JavaScript está habilitado
- Limpe o cache do navegador
- Tente em modo anônimo

## 📝 Notas

- Os votos são identificados por fingerprint do dispositivo, não por IP
- Trocar de navegador não permite votar novamente (mesmo dispositivo)
- Arquivos são salvos no sistema de arquivos (considere usar S3 em produção)
- O admin padrão deve ter a senha alterada imediatamente

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autor

Sistema desenvolvido para concursos de cantores.

---

🎤 **Boa sorte no seu concurso!** 🎵
