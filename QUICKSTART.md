# Quick Start — desenvolvimento local

## Pré-requisitos

- Node.js 20+
- Docker (só para o MongoDB local)

## Passos

1. **Suba o MongoDB:**

   ```bash
   docker compose up -d
   ```

2. **Crie o `.env.local`:**

   ```bash
   cp .env.example .env.local
   ```

   E preencha:

   ```
   MONGODB_URI=mongodb://admin:devpassword@localhost:27017/voting?authSource=admin
   JWT_SECRET=qualquer-string-longa-para-desenvolvimento
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=escolha-uma-senha
   NEXT_PUBLIC_MEDIA_BASE_URL=
   ```

   `NEXT_PUBLIC_MEDIA_BASE_URL` vazio faz a mídia ser servida direto do Vercel
   Blob, sem o CDN — é o que se quer em desenvolvimento.

3. **Instale e rode:**

   ```bash
   npm install
   npm run dev
   ```

Não há seed: o admin vem das variáveis de ambiente e as collections são criadas
na primeira escrita.

## Para testar upload de mídia localmente

O upload precisa do `BLOB_READ_WRITE_TOKEN`. Com o Blob store já criado na
Vercel (veja `DEPLOYMENT.md`):

```bash
npx vercel link
npx vercel env pull .env.local
```

Sem esse token, tudo funciona menos o upload de fotos e músicas.

## URLs

| Página          | URL                             |
| --------------- | ------------------------------- |
| Votação         | http://localhost:3000           |
| Painel admin    | http://localhost:3000/admin     |
| Inscrição       | http://localhost:3000/register  |

## Comandos úteis

```bash
docker compose logs -f mongodb   # logs do banco
docker compose down              # parar
docker compose down -v           # parar e APAGAR os dados
npm run build                    # validar o build de produção
```
