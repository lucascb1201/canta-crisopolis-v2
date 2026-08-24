# 📚 Índice da Documentação - Sistema de Votação

Bem-vindo ao sistema completo de votação para concurso de cantores! Este índice te guiará pela documentação completa do projeto.

## 🚀 Começar Agora

Se você quer começar rapidamente:

1. **[QUICKSTART.md](./QUICKSTART.md)** ⚡

   - Guia de início rápido
   - Comandos essenciais
   - Primeiros passos

2. **Execute:**

   ```bash
   docker compose up -d          # MongoDB local
   cp .env.example .env.local    # preencha as variáveis
   npm install && npm run dev
   ```

3. **Acesse:**
   - Homepage: http://localhost:3000
   - Admin: http://localhost:3000/admin/login
   - Credenciais: as que você definiu em `ADMIN_USERNAME` / `ADMIN_PASSWORD`

---

## 📖 Documentação Completa

### Essencial para Iniciantes

| Documento                               | Descrição                       | Quando Usar                    |
| --------------------------------------- | ------------------------------- | ------------------------------ |
| **[README.md](./README.md)** 📘         | Documentação principal completa | Primeiro contato com o projeto |
| **[QUICKSTART.md](./QUICKSTART.md)** ⚡ | Guia rápido de 5 minutos        | Quer iniciar rapidamente       |
| **[FAQ.md](./FAQ.md)** ❓               | Perguntas frequentes e soluções | Tem dúvidas ou problemas       |

### Arquitetura e Detalhes Técnicos

| Documento                                         | Descrição                       | Quando Usar                 |
| ------------------------------------------------- | ------------------------------- | --------------------------- |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🏗️       | Arquitetura completa do sistema | Quer entender como funciona |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** 📋 | Resumo de tudo que foi criado   | Visão geral do projeto      |

### Deploy e Produção

| Documento                               | Descrição               | Quando Usar             |
| --------------------------------------- | ----------------------- | ----------------------- |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** 🚀 | Guia completo de deploy | Vai colocar em produção |

---

## 📂 Estrutura de Arquivos por Categoria

### ⚙️ Configuração

```
📦 Arquivos de Configuração
├── docker-compose.yml          # MongoDB local (desenvolvimento)
├── vercel.json                 # Região das funções (gru1)
├── package.json                # Dependências NPM
├── tsconfig.json              # Config TypeScript
├── tailwind.config.js         # Config Tailwind CSS
├── next.config.js             # Config Next.js
├── postcss.config.js          # Config PostCSS
├── .env.example               # Template de variáveis
└── .gitignore                 # Arquivos ignorados
```

### 🎨 Frontend - Páginas

```
📱 Páginas
├── src/app/page.tsx                        # 🏠 Homepage (votação pública)
├── src/app/register/page.tsx               # 📝 Inscrição de candidatos
├── src/app/admin/login/page.tsx            # 🔐 Login administrativo
├── src/app/admin/page.tsx                  # 👨‍💼 Dashboard admin
├── src/app/admin/votings/new/page.tsx      # ➕ Criar votação
└── src/app/admin/votings/[id]/page.tsx     # ✏️ Editar votação
```

### 🔌 Backend - API Routes

```
🌐 API Endpoints
├── Autenticação
│   ├── src/app/api/auth/login/route.ts     # POST /api/auth/login
│   ├── src/app/api/auth/logout/route.ts    # POST /api/auth/logout
│   └── src/app/api/auth/me/route.ts        # GET /api/auth/me
│
├── Votações
│   ├── src/app/api/votings/route.ts                    # GET/POST /api/votings
│   ├── src/app/api/votings/[id]/route.ts               # GET/PUT/DELETE
│   ├── src/app/api/votings/[id]/vote/route.ts         # POST vote
│   └── src/app/api/votings/[id]/check-vote/route.ts   # POST check
│
└── Candidatos
    └── src/app/api/candidates/route.ts     # POST /api/candidates
```

### 🗄️ Banco de Dados - Modelos

```
💾 Models (Mongoose)
├── src/models/Admin.ts        # 👤 Administradores
├── src/models/Voting.ts       # 🗳️ Votações
├── src/models/Vote.ts         # ✅ Votos registrados
└── src/models/Candidate.ts    # 🎤 Candidatos inscritos
```

### 🧩 Componentes e Utilitários

```
🔧 Utilitários
├── Componentes
│   └── src/components/MusicPlayer.tsx      # 🎵 Player de música
│
├── Contexts
│   └── src/contexts/AuthContext.tsx        # 🔄 Context de autenticação
│
├── Hooks
│   └── src/hooks/useDeviceFingerprint.ts   # 🔍 Hook de fingerprint
│
└── Bibliotecas
    ├── src/lib/mongodb.ts                  # 🗄️ Conexão MongoDB
    ├── src/lib/jwt.ts                      # 🎫 Geração/verificação JWT
    ├── src/lib/auth.ts                     # 🔐 Middleware de auth
    ├── src/lib/fingerprint.ts              # 👆 Device fingerprinting
    └── src/lib/upload.ts                   # 📤 Upload de arquivos
```

---

## 🎯 Guias por Caso de Uso

### 👨‍💻 Desenvolvedor Iniciante

1. Leia o **[README.md](./README.md)**
2. Execute o **[QUICKSTART.md](./QUICKSTART.md)**
3. Consulte o **[FAQ.md](./FAQ.md)** quando tiver dúvidas

### 🔧 Desenvolvedor Avançado

1. Estude a **[ARCHITECTURE.md](./ARCHITECTURE.md)**
2. Revise o **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**
3. Customize conforme necessário

### 🚀 Preparando para Produção

1. Siga o **[DEPLOYMENT.md](./DEPLOYMENT.md)**
2. Revise o checklist de segurança
3. Configure monitoramento

### ❓ Resolvendo Problemas

1. Consulte primeiro o **[FAQ.md](./FAQ.md)**
2. Localmente, veja os logs do `npm run dev` e `docker compose logs -f mongodb`
3. Em produção, use **Observability** e **Logs** no dashboard da Vercel

---

## 📊 Fluxograma de Leitura

```
        COMEÇAR AQUI
             │
             ▼
    ┌─────────────────┐
    │   README.md     │ ◄─── Sempre comece aqui
    └────────┬────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
┌────────────┐ ┌────────────┐
│QUICKSTART  │ │    FAQ     │
│   .md      │ │   .md      │
└────────────┘ └────────────┘
       │           │
       │     (Tem dúvidas?)
       │           │
       └─────┬─────┘
             │
    (Quer entender mais?)
             │
             ▼
    ┌─────────────────┐
    │ARCHITECTURE.md  │
    │PROJECT_SUMMARY  │
    └────────┬────────┘
             │
    (Vai para produção?)
             │
             ▼
    ┌─────────────────┐
    │ DEPLOYMENT.md   │
    └─────────────────┘
```

---

## 🔍 Busca Rápida

### Por Tópico

| Tópico                 | Arquivo         | Seção                           |
| ---------------------- | --------------- | ------------------------------- |
| **Instalar**           | QUICKSTART.md   | Passos 1-3                      |
| **Login Admin**        | FAQ.md          | "Não consigo fazer login"       |
| **Upload de arquivos** | ARCHITECTURE.md | "Fluxo de Administração"        |
| **Votos duplicados**   | FAQ.md          | "Como previne votos duplicados" |
| **Deploy**             | DEPLOYMENT.md   | Todas as seções                 |
| **MongoDB**            | ARCHITECTURE.md | "Estrutura de Banco"            |
| **API Routes**         | ARCHITECTURE.md | "Backend - API Routes"          |
| **Docker**             | README.md       | "Como Executar"                 |
| **Segurança**          | DEPLOYMENT.md   | "Checklist de Segurança"        |
| **Performance**        | ARCHITECTURE.md | "Performance"                   |

### Por Problema

| Problema                | Solução em                                |
| ----------------------- | ----------------------------------------- |
| Erro de conexão MongoDB | FAQ.md → "Erro Cannot connect"            |
| Porta 3000 em uso       | FAQ.md → "Port already in use"            |
| Upload não funciona     | FAQ.md → "Upload de arquivo não funciona" |
| Música não toca         | FAQ.md → "Música não reproduz"            |
| Resultados não aparecem | FAQ.md → "Resultados não aparecem"        |
| Como alterar cores      | FAQ.md → "Como altero as cores"           |
| Deploy em produção      | DEPLOYMENT.md → Todas as seções           |

---

## 📈 Estatísticas do Projeto

```
📊 Números do Projeto
├── 📄 45 arquivos criados
├── 🎨 7 páginas frontend
├── 🔌 8 rotas de API
├── 🗄️ 4 modelos de banco
├── 🧩 1 componente React
├── 📚 6 documentações
├── 🛠️ 2 scripts utilitários
└── ⚙️ 9 arquivos de config
```

---

## ✅ Checklist do Desenvolvedor

### Primeira Vez

- [ ] Li o README.md
- [ ] Executei o QUICKSTART.md
- [ ] Sistema rodando com sucesso
- [ ] Fiz login como admin
- [ ] Criei uma votação de teste
- [ ] Votei como usuário público

### Antes de Customizar

- [ ] Entendi a ARCHITECTURE.md
- [ ] Revisei o PROJECT_SUMMARY.md
- [ ] Identifiquei o que quero mudar
- [ ] Li o FAQ para dúvidas comuns

### Antes de Deploy

- [ ] Li DEPLOYMENT.md completo
- [ ] Revisei checklist de segurança
- [ ] Configurei variáveis de ambiente
- [ ] Testei em ambiente de staging
- [ ] Configurei backup
- [ ] Configurei monitoramento

---

## 🆘 Suporte

### Auto-Atendimento (Recomendado)

1. **[FAQ.md](./FAQ.md)** - 90% das dúvidas estão aqui
2. **Logs locais**: saída do `npm run dev`
3. **Logs de produção**: dashboard da Vercel → Logs

### Recursos Adicionais

- 📖 Documentação Next.js: https://nextjs.org/docs
- 📖 Documentação MongoDB: https://docs.mongodb.com
- 📖 Documentação Docker: https://docs.docker.com

---

## 🎓 Aprendizado

### Para Iniciantes em Web Dev

Aprenda nesta ordem:

1. HTML/CSS básico
2. JavaScript básico
3. React fundamentos
4. Next.js basics
5. MongoDB basics

### Para Iniciantes em Docker

1. Docker basics (imagens, containers)
2. Docker Compose
3. Networks e Volumes

### Para Iniciantes em TypeScript

1. TypeScript handbook
2. Tipos básicos
3. Interfaces e Types
4. Generics

---

## 📝 Notas Finais

- **Mantenha a documentação atualizada** se fizer mudanças
- **Leia o FAQ primeiro** antes de buscar ajuda
- **Customize** o sistema para suas necessidades
- **Contribua** com melhorias via Pull Request

---

## 🎯 Links Rápidos

| Ação         | Link                              |
| ------------ | --------------------------------- |
| 🏠 Homepage  | http://localhost:3000             |
| 👨‍💼 Admin     | http://localhost:3000/admin/login |
| 📝 Inscrição | http://localhost:3000/register    |
| 🗄️ MongoDB   | mongodb://localhost:27017         |

---

**Última atualização**: Outubro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Completo e funcional

🎤 **Boa sorte com seu concurso de cantores!** 🎵
