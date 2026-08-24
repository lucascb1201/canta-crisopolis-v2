# Deploy — Vercel + MongoDB Atlas + Vercel Blob

Arquitetura de produção:

```
Navegador
  ├── HTML/API ──────────► Vercel (Next.js Serverless, região gru1)
  │                            └── MongoDB Atlas
  ├── upload de mídia ───► Vercel Blob (direto do browser, sem passar pela função)
  └── leitura de mídia ──► Vercel Blob (domínio público do store)
```

O upload vai **direto do browser para o Blob**. Isso é obrigatório: uma Serverless
Function na Vercel aceita no máximo ~4.5MB de body, e um MP3 estoura isso.

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
3. O hostname do store (`4tf85brexuw1cgkz.public.blob.vercel-storage.com`) é o
   domínio público de onde a mídia será servida.

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
| `NEXT_PUBLIC_MEDIA_BASE_URL` | **Não cadastre** (serve direto do domínio do Blob)        |
| `BLOB_READ_WRITE_TOKEN`      | **Injetado pela Vercel** ao conectar o Blob store        |

Sem `JWT_SECRET` a aplicação lança erro em vez de assinar com um segredo padrão.
Sem `ADMIN_USERNAME`/`ADMIN_PASSWORD` o login responde 500 em vez de autenticar.

Sobre `NEXT_PUBLIC_MEDIA_BASE_URL`: o mais simples é **não criá-la**. Ao criar,
a Vercel sugere remover o prefixo `NEXT_PUBLIC_` para "manter o valor privado" —
**não siga essa sugestão**. A variável é lida em `src/app/page.tsx`, um client
component; sem o prefixo ela chega `undefined` no browser e é ignorada em
silêncio, sem erro. Expor é inofensivo: é o hostname de um CDN público, já
visível em cada `<img src>` da página.

Ela também é lida no build do bundle client — ao alterá-la é preciso
**redeploy**, não basta salvar a variável.

## 4. Domínio de leitura da mídia

A mídia é servida direto pelo domínio público do Blob store:

```
https://4tf85brexuw1cgkz.public.blob.vercel-storage.com/<pathname>
```

Não há nada a configurar — o Blob já tem CDN próprio e certificado válido, e a
URL canônica salva no banco é a que vai para o `<img>` e o `<audio>`.

Não cadastre `NEXT_PUBLIC_MEDIA_BASE_URL`. Preenchida, ela troca a origem das
URLs na renderização (`src/lib/media.ts`) — é a porta de entrada para colocar um
CDN próprio na frente do Blob mais tarde, sem migrar nada do que já está salvo.
Se um dia for usada, o prefixo `NEXT_PUBLIC_` é obrigatório.

> **Custo:** o Vercel Blob cobra Data Transfer na saída, e sem CDN intermediário
> toda reprodução de música sai dele. Se a banda virar problema, as saídas são
> um proxy com cache (Cloudflare Worker, apontando `NEXT_PUBLIC_MEDIA_BASE_URL`
> para ele) ou migrar para um storage com egress zero, como o Cloudflare R2.

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
- [ ] Na home, `<img>` e `<audio>` carregam a partir de
      `4tf85brexuw1cgkz.public.blob.vercel-storage.com`
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

**Custos:** Vercel Hobby + Atlas M0 = US$ 0/mês. O Vercel Blob cobra por GB
armazenado **e por Data Transfer** — sem CDN intermediário, cada reprodução de
música conta. Acompanhe o consumo em Storage → Blob no dashboard durante o
evento.

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
