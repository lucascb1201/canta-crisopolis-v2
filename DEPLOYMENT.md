# Deploy — Vercel + MongoDB Atlas + Vercel Blob + Cloudflare

Arquitetura de produção:

```
Navegador
  ├── HTML/API ──────────► Vercel (Next.js Serverless, região gru1)
  │                            └── MongoDB Atlas
  ├── upload de mídia ───► Vercel Blob (direto do browser, sem passar pela função)
  └── leitura de mídia ──► media.cantacrisopolis.com.br (Cloudflare CDN → Vercel Blob)
```

O upload vai **direto do browser para o Blob**. Isso é obrigatório: uma Serverless
Function na Vercel aceita no máximo ~4.5MB de body, e um MP3 estoura isso.

A leitura passa pela Cloudflare para que a banda dos MP3 — o item mais pesado,
baixado por cada votante — não saia do Data Transfer cobrado pela Vercel.

---

## 1. MongoDB Atlas

1. Crie o cluster (M0 grátis já atende) na região **São Paulo (sa-east-1)** para
   casar com a região `gru1` configurada em `vercel.json`.
2. **Database Access** → crie um usuário com senha forte e role `readWrite` no
   banco da aplicação.
3. **Network Access** → libere `0.0.0.0/0`.

   A Vercel não oferece IPs de saída fixos no plano Hobby, então não há como
   restringir por IP. A segurança fica por conta da senha do usuário do banco —
   use uma senha longa e aleatória, não a reaproveite em nenhum outro lugar.

4. Copie a connection string (`mongodb+srv://...`) e acrescente o nome do banco:
   `mongodb+srv://usuario:senha@cluster.xxxxx.mongodb.net/voting?retryWrites=true&w=majority`

Não há seed a rodar: o admin vem de variável de ambiente e as collections são
criadas na primeira escrita.

## 2. Vercel Blob

1. No dashboard da Vercel: **Storage** → **Create Database** → **Blob**.
2. Conecte o store ao projeto. A Vercel injeta `BLOB_READ_WRITE_TOKEN` nas
   variáveis de ambiente automaticamente — **não** cadastre esse token à mão.
3. Anote o hostname do store (`<store-id>.public.blob.vercel-storage.com`). Ele é
   necessário no passo do Cloudflare.

Limites aplicados pelo servidor em `src/app/api/upload/route.ts`:

| Tipo   | Formatos aceitos               | Tamanho máximo |
| ------ | ------------------------------ | -------------- |
| Foto   | JPEG, PNG, WebP, GIF           | 5 MB           |
| Música | MP3, WAV, OGG, MP4/M4A         | 15 MB          |

O token de upload só é emitido para quem tem o cookie de admin válido.

## 3. Variáveis de ambiente na Vercel

Em **Settings → Environment Variables**:

| Variável                     | Observação                                              |
| ---------------------------- | ------------------------------------------------------- |
| `MONGODB_URI`                | Connection string do Atlas                              |
| `JWT_SECRET`                 | Mínimo 32 caracteres aleatórios (`openssl rand -hex 32`) |
| `ADMIN_USERNAME`             | Usuário do painel                                        |
| `ADMIN_PASSWORD`             | Senha do painel                                          |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | `https://media.cantacrisopolis.com.br`                   |
| `BLOB_READ_WRITE_TOKEN`      | **Injetado pela Vercel** ao conectar o Blob store        |

Sem `JWT_SECRET` a aplicação lança erro em vez de assinar com um segredo padrão.
Sem `ADMIN_USERNAME`/`ADMIN_PASSWORD` o login responde 500 em vez de autenticar.

`NEXT_PUBLIC_MEDIA_BASE_URL` é lida no build do bundle client — ao alterá-la é
preciso **redeploy**, não basta salvar a variável.

## 4. Cloudflare — `media.cantacrisopolis.com.br`

Objetivo: servir os arquivos do Blob pelo CDN, pagando banda do Vercel Blob só
no cache MISS.

O Vercel Blob **não suporta domínio customizado nativamente**, e o caminho
"CNAME + Origin Rule com Host Header override" **não funciona fora do plano
Enterprise** — Host header, SNI e DNS record são recursos Enterprise no Origin
Rules. A forma que funciona no plano Free é um Worker.

O código está em [`cloudflare/media-proxy.js`](../cloudflare/media-proxy.js).

### 4.1 Descobrir o hostname do store

Faça um upload qualquer pelo painel e olhe a URL salva. Ela tem a forma
`https://abc123def456.public.blob.vercel-storage.com/...` — a parte antes de
`/` é o `BLOB_HOST`.

### 4.2 Deploy do Worker

**Via wrangler** (recomendado):

```bash
cd cloudflare
# edite BLOB_HOST no wrangler.toml
npx wrangler deploy
```

O `custom_domain = true` na rota faz a Cloudflare criar o registro DNS e o
certificado de `media.cantacrisopolis.com.br` sozinha.

**Via dashboard**, se preferir não usar CLI:

1. **Workers & Pages** → **Create** → **Worker**, nome `canta-crisopolis-media`
2. Cole o conteúdo de `cloudflare/media-proxy.js` e faça deploy
3. **Settings** → **Variables** → adicione `BLOB_HOST` com o hostname do store
4. **Settings** → **Domains & Routes** → **Add** → **Custom domain** →
   `media.cantacrisopolis.com.br`

### 4.3 Validação

```bash
curl -sI https://media.cantacrisopolis.com.br/<pathname-de-um-arquivo>
```

- 1ª chamada: `200` + `cf-cache-status: MISS`
- 2ª chamada: `200` + `cf-cache-status: HIT` ← confirma que a banda parou de sair do Blob
- `content-type` correto (`audio/mpeg` para MP3)

Se vier `500 BLOB_HOST is not configured`, a variável não foi salva. Se vier
`404`, confira o pathname — ele é exatamente o que vem depois do domínio na URL
canônica do Blob.

### 4.4 Limites a conhecer

- **Workers Free: 100.000 requests/dia.** Cada arquivo servido conta, mesmo em
  cache HIT (a rota sempre invoca o Worker). Um evento com milhares de votantes
  ouvindo várias músicas pode chegar perto disso — vale acompanhar no dashboard.
- **Requests com `Range`** (o que o navegador usa para dar seek em áudio) são
  repassados ao Blob e respondem `206`. O cache é menos eficiente nesse caso;
  o efeito é banda extra, não falha.
- Servir volume alto de áudio pelo Free tier esbarra na política de uso da
  Cloudflare para mídia não-HTML. Para o porte de um concurso municipal não deve
  ser problema, mas vale conhecer o limite.

## 5. Deploy

1. Importe o repositório na Vercel (framework Next.js é detectado sozinho).
2. Confirme as variáveis do passo 3.
3. Deploy. `vercel.json` fixa as funções em `gru1` (São Paulo).

Os deploys seguintes saem de `git push`.

## 6. Checklist pós-deploy

- [ ] `/admin/login` autentica com as credenciais das env vars
- [ ] Senha errada devolve 401
- [ ] Criar votação com foto e música funciona; no DevTools, o `PUT` do arquivo
      vai para `*.vercel-storage.com`, **não** para `/api/votings`
- [ ] Na home, `<img>` e `<audio>` apontam para `media.cantacrisopolis.com.br`
- [ ] `cf-cache-status: HIT` na segunda requisição de mídia
- [ ] O MP3 só é baixado ao clicar em "Ouvir" (`preload="none"`)
- [ ] Votar funciona; votar de novo no mesmo dispositivo é bloqueado
- [ ] Com "Resultados Ocultos", a resposta de `GET /api/votings` não traz `votes`
- [ ] Em **Observability**, nenhuma função estoura os 10s do plano Hobby

## 7. Operação

**Trocar a senha do admin:** edite `ADMIN_PASSWORD` nas env vars e faça redeploy.
Os cookies já emitidos continuam válidos por até 7 dias — para invalidá-los na
hora, troque também o `JWT_SECRET`.

**Backup:** Atlas M0 não tem backup automático. Para um evento com resultado
oficial, use `mongodump` antes e depois da apuração, ou suba para M10.

**Custos:** Vercel Hobby + Atlas M0 + Cloudflare Free = US$ 0/mês. O Vercel Blob
cobra por GB armazenado; com a Cloudflare na frente, a saída de dados fica
restrita aos cache MISS.

## 8. Limitações conhecidas

- **O fingerprint vem do cliente.** O FingerprintJS OSS é uma barreira contra o
  votante casual, não contra fraude: um `curl` com fingerprints aleatórios vota
  quantas vezes quiser. Não há rate limiting nem CAPTCHA. Para um concurso com
  resultado disputado, isso precisa ser endereçado.
- **`/admin` não tem proteção server-side.** O HTML da página é servido a
  qualquer visitante; quem protege são os handlers de API. Não há vazamento de
  dados, mas também não há `middleware.ts`.
- **Não há tela para as inscrições de candidatos.** `POST /api/candidates` grava
  na collection `candidates` e nada no app lê de volta — só via Atlas.
