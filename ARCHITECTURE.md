# Arquitetura do Sistema 🏗️

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     USUÁRIO / NAVEGADOR                      │
└──────────────┬────────────────────────┬─────────────────────┘
               │                        │
       ┌───────▼────────┐      ┌───────▼────────┐
       │  Página Pública │      │  Painel Admin  │
       │   (Votação)     │      │   (Gestão)     │
       └───────┬─────────┘      └───────┬────────┘
               │                        │
               └────────┬───────────────┘
                        │
            ┌───────────▼───────────┐
            │    Next.js Server     │
            │   (API Routes + SSR)  │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼────┐    ┌────▼────┐    ┌────▼─────┐
    │MongoDB │    │File Sys.│    │Fingerprint│
    │(Dados) │    │(Uploads)│    │   (ID)    │
    └────────┘    └─────────┘    └──────────┘
```

## Fluxo de Dados

### 1. Fluxo de Votação

```
┌──────────┐
│ Usuário  │ 1. Acessa página
│ Público  │    http://localhost:3000
└────┬─────┘
     │
     │ 2. Carrega votações visíveis
     ▼
┌─────────────────┐
│   GET /api/     │
│   votings       │ 3. Busca no MongoDB
└────┬────────────┘    (isVisible: true)
     │
     │ 4. Retorna lista
     ▼
┌──────────────┐
│   Página     │ 5. Usuário seleciona
│   Renderiza  │    candidato e clica
│   Votações   │    "Confirmar Voto"
└────┬─────────┘
     │
     │ 6. Gera fingerprint
     │    do dispositivo
     ▼
┌──────────────────┐
│  FingerprintJS   │ 7. Retorna ID único
│  Library         │
└────┬─────────────┘
     │
     │ 8. POST /api/votings/[id]/vote
     │    { optionId, deviceFingerprint }
     ▼
┌────────────────────┐
│  API Vote Handler  │ 9. Verifica se já votou
└────┬───────────────┘
     │
     ├─► 10a. Já votou?
     │         └─► Retorna erro 400
     │
     └─► 10b. Primeira vez?
              │
              │ 11. Registra voto
              │     na tabela "votes"
              ▼
         ┌─────────┐
         │MongoDB  │ 12. Incrementa contador
         │votes    │     da opção votada
         │votings  │
         └─────────┘
              │
              │ 13. Retorna sucesso
              ▼
         ┌──────────┐
         │ Usuário  │ 14. Vê confirmação
         │ Recebe   │     "Voto registrado!"
         │Feedback  │
         └──────────┘
```

### 2. Fluxo de Administração

```
┌──────────┐
│  Admin   │ 1. Acessa /admin/login
└────┬─────┘
     │
     │ 2. POST /api/auth/login
     │    { username, password }
     ▼
┌─────────────────┐
│ Login Handler   │ 3. Busca admin no banco
└────┬────────────┘    4. Compara senha (bcrypt)
     │
     ├─► 5a. Inválido?
     │         └─► Retorna erro 401
     │
     └─► 5b. Válido?
              │
              │ 6. Gera JWT token
              ▼
         ┌──────────┐
         │JWT + Set │ 7. Salva em cookie
         │  Cookie  │    HTTP-only
         └─────┬────┘
               │
               │ 8. Redirect /admin
               ▼
         ┌────────────┐
         │  Dashboard │ 9. Lista votações
         │   Admin    │    GET /api/votings?admin=true
         └─────┬──────┘
               │
               │ 10. Admin cria nova votação
               ▼
         ┌─────────────────┐
         │ Formulário      │ 11. Preenche dados
         │ Nova Votação    │     + Upload arquivos
         └─────┬───────────┘
               │
               │ 12a. POST /api/upload
               │      (valida admin, tipo e
               │      tamanho; devolve token)
               │ 12b. Browser envia o arquivo
               │      DIRETO ao Vercel Blob
               ▼
         ┌──────────────┐
         │ Vercel Blob  │ 13. Armazena e devolve
         └──────┬───────┘     a URL ao browser
                │
                │ 14. POST /api/votings (JSON com as URLs)
                ▼
         ┌─────────┐
         │MongoDB  │ 15. Salva votação
         │votings  │     com URLs dos arquivos
         └─────────┘
                │
                │ 16. Retorna sucesso
                ▼
         ┌──────────┐
         │Redirect  │ 17. Volta para dashboard
         │/admin    │
         └──────────┘
```

### 3. Fluxo de Inscrição de Candidatos

```
┌──────────┐
│Candidato │ 1. Acessa /register
└────┬─────┘
     │
     │ 2. Preenche formulário
     │    (nome, email, telefone, etc.)
     ▼
┌─────────────────┐
│   Formulário    │ 3. Submit
│   Validação     │
└────┬────────────┘
     │
     │ 4. POST /api/candidates
     │    { firstName, lastName, ... }
     ▼
┌──────────────────┐
│Candidate Handler │ 5. Valida dados
└────┬─────────────┘    6. Valida email
     │
     │ 7. Salva no banco
     ▼
┌─────────┐
│MongoDB  │
│candidates│
└─────────┘
     │
     │ 8. Retorna sucesso
     ▼
┌──────────┐
│Tela de   │ 9. Mostra confirmação
│Sucesso   │
└──────────┘
```

## Estrutura de Banco de Dados

### Collections

```
voting (database)
│   (não há collection de admins: as credenciais vêm de
│    ADMIN_USERNAME / ADMIN_PASSWORD nas variáveis de ambiente)
│
├── votings
│   ├── _id: ObjectId
│   ├── title: String
│   ├── description: String
│   ├── options: Array
│   │   ├── id: String
│   │   ├── name: String
│   │   ├── photoUrl: String
│   │   ├── musicUrl: String
│   │   └── votes: Number
│   ├── isVisible: Boolean
│   ├── isClosed: Boolean
│   ├── showResults: Boolean
│   ├── createdAt: Date
│   └── updatedAt: Date
│
├── votes
│   ├── _id: ObjectId
│   ├── votingId: ObjectId (ref: Voting)
│   ├── optionId: String
│   ├── deviceFingerprint: String
│   ├── ipAddress: String
│   ├── userAgent: String
│   └── createdAt: Date
│   └── INDEX: { votingId, deviceFingerprint } (unique)
│
└── candidates
    ├── _id: ObjectId
    ├── firstName: String
    ├── lastName: String
    ├── phone: String
    ├── email: String
    ├── address: String
    ├── city: String
    ├── state: String
    ├── zipCode: String
    └── createdAt: Date
```

## Estrutura de Diretórios

```
voting/
│
├── 📦 Configuração
│   ├── docker-compose.yml      # MongoDB local (desenvolvimento)
│   ├── vercel.json             # Região das funções (gru1)
│   ├── package.json            # Dependências
│   ├── tsconfig.json           # Config TypeScript
│   ├── tailwind.config.js      # Config Tailwind
│   ├── next.config.js          # Config Next.js
│   └── .env.example            # Variáveis de ambiente
│
├── 📜 Documentação
│   ├── README.md               # Doc principal
│   ├── QUICKSTART.md           # Início rápido
│   ├── DEPLOYMENT.md           # Guia de deploy
│   ├── FAQ.md                  # Perguntas frequentes
│   ├── PROJECT_SUMMARY.md      # Resumo completo
│   └── ARCHITECTURE.md         # Este arquivo
│
├── 🎨 Frontend
│   └── src/
│       ├── app/                # App Router Next.js
│       │   ├── page.tsx        # 🏠 Homepage (votação)
│       │   ├── layout.tsx      # Layout global
│       │   ├── globals.css     # Estilos globais
│       │   │
│       │   ├── admin/          # 👨‍💼 Painel Admin
│       │   │   ├── page.tsx            # Dashboard
│       │   │   ├── login/
│       │   │   │   └── page.tsx        # Login
│       │   │   └── votings/
│       │   │       ├── new/
│       │   │       │   └── page.tsx    # Nova votação
│       │   │       └── [id]/
│       │   │           └── page.tsx    # Editar votação
│       │   │
│       │   ├── register/       # 📝 Inscrição
│       │   │   └── page.tsx
│       │   │
│       │   └── api/            # 🔌 API Routes
│       │       ├── auth/
│       │       │   ├── login/
│       │       │   │   └── route.ts    # POST login
│       │       │   ├── logout/
│       │       │   │   └── route.ts    # POST logout
│       │       │   └── me/
│       │       │       └── route.ts    # GET user
│       │       │
│       │       ├── votings/
│       │       │   ├── route.ts        # GET/POST votings
│       │       │   └── [id]/
│       │       │       ├── route.ts    # GET/PUT/DELETE
│       │       │       ├── vote/
│       │       │       │   └── route.ts    # POST vote
│       │       │       └── check-vote/
│       │       │           └── route.ts    # POST check
│       │       │
│       │       └── candidates/
│       │           └── route.ts        # POST candidate
│       │
│       ├── components/         # 🧩 Componentes
│       │   └── MusicPlayer.tsx # Player de música
│       │
│       ├── contexts/           # 🔄 React Context
│       │   └── AuthContext.tsx # Context de auth
│       │
│       ├── hooks/              # 🪝 Custom Hooks
│       │   └── useDeviceFingerprint.ts
│       │
│       ├── lib/                # 📚 Utilitários
│       │   ├── mongodb.ts      # Conexão MongoDB
│       │   ├── jwt.ts          # JWT utils
│       │   ├── auth.ts         # Auth middleware
│       │   ├── fingerprint.ts  # Device fingerprint
│       │   └── upload.ts       # Upload de arquivos
│       │
│       └── models/             # 🗂️ Modelos Mongoose
│           ├── Voting.ts
│           ├── Vote.ts
│           └── Candidate.ts
```

> Fotos e músicas não ficam no repositório nem no filesystem: vão para o Vercel
> Blob e são servidas pelo CDN em `media.cantacrisopolis.com.br`.

## Tecnologias e Propósito

```
┌──────────────────────────────────────────────────────┐
│                    STACK COMPLETO                     │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Frontend                                             │
│  ├─ Next.js 14        ► Framework React + SSR        │
│  ├─ React 18          ► Biblioteca UI                │
│  ├─ TypeScript        ► Type safety                  │
│  ├─ Tailwind CSS      ► Estilização                  │
│  └─ React Icons       ► Ícones                       │
│                                                       │
│  Backend                                              │
│  ├─ Next.js API Routes ► Endpoints REST              │
│  ├─ Mongoose          ► ODM MongoDB                  │
│  └─ Bcrypt            ► Hash de senhas               │
│                                                       │
│  Autenticação                                         │
│  ├─ JWT               ► Tokens de sessão             │
│  ├─ Cookies           ► Armazenamento seguro         │
│  └─ FingerprintJS     ► Identificação de dispositivo │
│                                                       │
│  Banco de Dados                                       │
│  └─ MongoDB 7.0       ► Database NoSQL               │
│                                                       │
│  Infraestrutura                                       │
│  ├─ Vercel            ► Hospedagem serverless        │
│  ├─ MongoDB Atlas     ► Banco gerenciado             │
│  ├─ Vercel Blob       ► Armazenamento de mídia       │
│  ├─ Cloudflare        ► CDN de leitura da mídia      │
│  └─ Docker Compose    ► MongoDB local (dev)          │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Segurança

```
┌─────────────────────────────────────────┐
│          CAMADAS DE SEGURANÇA            │
├─────────────────────────────────────────┤
│                                          │
│  1️⃣ Autenticação Admin                  │
│     ├─ JWT em HTTP-only cookie          │
│     ├─ Bcrypt para hash de senhas       │
│     └─ Middleware de proteção           │
│                                          │
│  2️⃣ Prevenção de Votos Duplicados       │
│     ├─ Device fingerprinting            │
│     ├─ Índice único no MongoDB          │
│     └─ Validação no servidor            │
│                                          │
│  3️⃣ Validação de Dados                  │
│     ├─ Client-side validation           │
│     ├─ Server-side validation           │
│     └─ Type checking (TypeScript)       │
│                                          │
│  4️⃣ Proteção de Upload                  │
│     ├─ Validação de tipo de arquivo     │
│     ├─ Limite de tamanho                │
│     └─ Sanitização de nomes             │
│                                          │
│  5️⃣ Segurança do Banco                  │
│     ├─ Autenticação obrigatória         │
│     ├─ Mongoose ODM (prevenção NoSQL inj)│
│     └─ Validação de schemas             │
│                                          │
└─────────────────────────────────────────┘
```

## Performance

```
┌──────────────────────────────────┐
│     OTIMIZAÇÕES IMPLEMENTADAS     │
├──────────────────────────────────┤
│                                   │
│  ✅ Server-Side Rendering (SSR)  │
│  ✅ Static Asset Optimization     │
│  ✅ Image Optimization (Next.js)  │
│  ✅ Code Splitting (automático)   │
│  ✅ Lazy Loading de componentes   │
│  ✅ Índices no MongoDB            │
│  ✅ Connection pooling (Mongoose) │
│  ✅ CSS Purge (Tailwind)          │
│                                   │
└──────────────────────────────────┘
```

## Próximas Melhorias Sugeridas

```
📋 ROADMAP
├── 🔥 Alta Prioridade
│   ├─ [ ] Paginação de votações
│   ├─ [ ] Cache com Redis
│   ├─ [ ] Rate limiting
│   └─ [ ] Testes automatizados
│
├── 🎯 Média Prioridade
│   ├─ [ ] Notificações em tempo real
│   ├─ [ ] Exportação de resultados
│   ├─ [ ] Gráficos de resultados
│   └─ [ ] Sistema de categorias
│
└── 💡 Baixa Prioridade
    ├─ [ ] Chat de suporte
    ├─ [ ] Sistema de comentários
    ├─ [ ] Compartilhamento social
    └─ [ ] PWA (Progressive Web App)
```

---

**Documentação atualizada em**: Outubro de 2025
**Versão do sistema**: 1.0.0
