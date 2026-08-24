# Canta Crisópolis — Sistema de Votação 🎤

Sistema de votação para concurso de cantores, em Next.js 14 + MongoDB,
hospedado na Vercel.

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
- **Backend**: Next.js API Routes
- **Banco de Dados**: MongoDB (Atlas em produção)
- **Hospedagem**: Vercel
- **Mídia**: Vercel Blob para armazenamento, Cloudflare como CDN de leitura
- **Autenticação**: JWT em cookie HTTP-only, credenciais em variáveis de ambiente
- **Identificação de Dispositivo**: FingerprintJS

## 📋 Pré-requisitos

- Node.js 20+
- Docker (apenas para o MongoDB local em desenvolvimento)

## 🚀 Como Executar

### Desenvolvimento local

```bash
docker compose up -d          # sobe apenas o MongoDB
cp .env.example .env.local    # preencha as variáveis
npm install
npm run dev
```

Não há seed a rodar: o usuário admin vem de `ADMIN_USERNAME` / `ADMIN_PASSWORD`,
e as collections são criadas na primeira escrita.

Passo a passo detalhado, incluindo como testar upload de mídia localmente:
[`QUICKSTART.md`](./QUICKSTART.md).

### Produção

Deploy na Vercel, com MongoDB Atlas, Vercel Blob e Cloudflare como CDN de mídia:
[`DEPLOYMENT.md`](./DEPLOYMENT.md).

## 📱 Uso do Sistema

### Acesso Público

1. Acesse a página principal
2. Visualize as votações disponíveis
3. Clique em um candidato para selecioná-lo
4. Clique em "Ouvir" para reproduzir a música
5. Clique em "Confirmar Voto" para registrar seu voto

### Inscrição de Candidatos

1. Acesse `/register`
2. Preencha o formulário com seus dados
3. Envie a inscrição

> As inscrições ficam na collection `candidates`. Não existe tela para
> consultá-las — hoje só via MongoDB Atlas.

### Painel Administrativo

1. Acesse `/admin/login`
2. Faça login com as credenciais definidas em `ADMIN_USERNAME` / `ADMIN_PASSWORD`
3. No painel, você pode:
   - Criar nova votação
   - Editar votações existentes
   - Alternar visibilidade
   - Abrir/fechar votações
   - Mostrar/ocultar resultados
   - Excluir votações

## 🖼️ Como a mídia funciona

O arquivo vai **do browser direto para o Vercel Blob**, sem passar pela API — uma
Serverless Function na Vercel aceita no máximo ~4.5MB de body, e um MP3 estoura
isso. A API só emite um token de upload de curta duração, depois de validar que
quem pediu é admin.

A leitura passa por `media.cantacrisopolis.com.br`, um proxy Cloudflare na frente
do Blob, para que a banda dos MP3 seja absorvida pelo CDN.

Limites aplicados no servidor:

| Tipo   | Formatos                | Tamanho máximo |
| ------ | ----------------------- | -------------- |
| Foto   | JPEG, PNG, WebP, GIF    | 5 MB           |
| Música | MP3, WAV, OGG, MP4/M4A  | 15 MB          |

## 🔒 Segurança

- **Prevenção de votos duplicados**: fingerprint do dispositivo (FingerprintJS)
  com índice único `{votingId, deviceFingerprint}` no MongoDB
- **Contagem atômica**: `$inc` no documento, sem perda de votos sob concorrência
- **Autenticação admin**: JWT em cookie HTTP-only; credenciais em variáveis de
  ambiente (a aplicação recusa subir sem `JWT_SECRET`)
- **Upload**: tipo e tamanho validados no servidor antes de emitir o token; as
  votações só aceitam URLs do próprio Blob store
- **Resultados ocultos**: quando desabilitados, os votos não vão na resposta da
  API — não só na interface

Limitações conhecidas (fingerprint falsificável, `/admin` sem proteção
server-side) estão em
[`DEPLOYMENT.md`](./DEPLOYMENT.md#8-limitações-conhecidas).

## 📁 Estrutura do Projeto

```
canta-crisopolis/
├── docker-compose.yml          # MongoDB local (desenvolvimento)
├── vercel.json                 # Região das funções (gru1)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # Login/logout/me
│   │   │   ├── upload/         # Emite tokens de upload do Vercel Blob
│   │   │   ├── votings/        # Votações e votos
│   │   │   └── candidates/     # Inscrições
│   │   ├── admin/              # Painel administrativo
│   │   ├── register/           # Página de inscrição
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/             # Componentes React
│   ├── contexts/               # Context API (Auth)
│   ├── hooks/                  # Custom Hooks
│   ├── lib/
│   │   ├── mongodb.ts          # Conexão MongoDB (pool ajustado p/ serverless)
│   │   ├── jwt.ts              # Geração/verificação JWT
│   │   ├── auth.ts             # Leitura do cookie de auth
│   │   ├── fingerprint.ts      # Device fingerprinting
│   │   ├── media.ts            # URL do Blob -> CDN de mídia
│   │   ├── blob.ts             # Remoção de blobs órfãos
│   │   ├── votings.ts          # Validação de options e ocultação de votos
│   │   └── uploadClient.ts     # Upload browser -> Vercel Blob
│   └── models/                 # Modelos Mongoose
│       ├── Voting.ts
│       ├── Vote.ts
│       └── Candidate.ts
```

## 🎨 Design

O sistema possui um design moderno com tema musical:

- Gradientes roxo/azul remetendo a palcos e shows
- Animações suaves e fluidas
- Interface responsiva (mobile-first)
- Ícones musicais em toda a aplicação
- Cards elegantes para candidatos
- Player de música integrado

## 🔧 Variáveis de Ambiente

```env
MONGODB_URI=                    # Connection string do MongoDB
JWT_SECRET=                     # Mínimo 32 caracteres aleatórios
ADMIN_USERNAME=                 # Usuário do painel
ADMIN_PASSWORD=                 # Senha do painel
BLOB_READ_WRITE_TOKEN=          # Injetado pela Vercel ao conectar o Blob store
NEXT_PUBLIC_MEDIA_BASE_URL=     # CDN de mídia; vazio em dev = servir do Blob
```

## 🐛 Troubleshooting

### Erro de conexão com MongoDB

```bash
docker compose ps          # o container está de pé?
docker compose logs mongodb
```

Em produção, confira se o Network Access do Atlas libera `0.0.0.0/0` — a Vercel
não tem IPs de saída fixos no plano Hobby.

### Upload de arquivos falha

Localmente, quase sempre é a ausência do `BLOB_READ_WRITE_TOKEN`. Rode
`npx vercel env pull .env.local` com o Blob store já criado.

Se o arquivo for recusado, verifique tipo e tamanho contra a tabela de limites.

### Mídia não carrega em produção

Teste a URL do CDN direto:

```bash
curl -sI https://media.cantacrisopolis.com.br/<pathname>
```

`403`/`404` normalmente significa que a Origin Rule com o Host Header override
não está ativa — veja `DEPLOYMENT.md`.

### Problemas com fingerprint

- Certifique-se de que o JavaScript está habilitado
- Limpe o cache do navegador
- Tente em modo anônimo

## 📝 Notas

- Os votos são identificados por fingerprint do dispositivo, não por IP
- Trocar de navegador não permite votar novamente (mesmo dispositivo)
- Trocar a senha do admin é editar `ADMIN_PASSWORD` e refazer o deploy; para
  invalidar as sessões já abertas, troque também o `JWT_SECRET`

## 📄 Licença

Este projeto está sob a licença MIT.

---

🎤 **Boa sorte no seu concurso!** 🎵
