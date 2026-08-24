# FAQ - Perguntas Frequentes ❓

## Instalação e Configuração

### ❓ Como eu inicio o projeto pela primeira vez?

Execute o script de inicialização:

```bash
docker compose up -d     # sobe apenas o MongoDB
cp .env.example .env.local
npm install
npm run dev
```

Não há seed a rodar: o admin vem de `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

### ❓ Preciso instalar o Node.js?

Sim. O Docker aqui serve só para o MongoDB de desenvolvimento — a aplicação roda
direto na sua máquina com `npm run dev`, e em produção roda na Vercel.

### ❓ Como acesso o MongoDB?

Use qualquer cliente MongoDB (MongoDB Compass, Studio 3T, etc.) com a mesma
string do seu `.env.local`, por exemplo:

```
mongodb://admin:devpassword@localhost:27017
```

## Uso do Sistema

### ❓ Não consigo fazer login como admin

Certifique-se de que:

1. `ADMIN_USERNAME` e `ADMIN_PASSWORD` estão definidos (em `.env.local` no local,
   nas Environment Variables da Vercel em produção)
2. `JWT_SECRET` também está definido — sem ele a aplicação recusa autenticar
3. Depois de alterar variáveis na Vercel, é preciso **redeploy**

### ❓ Posso votar mais de uma vez?

Não. O sistema usa device fingerprinting que identifica seu dispositivo único. Mesmo mudando de navegador, você não poderá votar novamente no mesmo dispositivo.

### ❓ Como o sistema previne votos duplicados?

Usamos a biblioteca FingerprintJS que gera um ID único baseado em:

- User Agent
- Resolução de tela
- Timezone
- Canvas fingerprint
- WebGL fingerprint
- Audio fingerprint
- Fonts instaladas
- E muitos outros fatores

### ❓ Posso criar múltiplas votações simultâneas?

Sim! Você pode ter quantas votações quiser ativas ao mesmo tempo, cada uma com suas próprias opções e configurações.

### ❓ Qual o limite de opções por votação?

Não há limite técnico. Você pode adicionar quantas opções quiser.

### ❓ Qual o tamanho máximo de arquivo para upload?

- **Fotos**: 5 MB
- **Músicas**: 15 MB

Esses limites são aplicados pelo servidor em `src/app/api/upload/route.ts`, antes
de o arquivo começar a subir — não são apenas recomendações.

### ❓ Que formatos de arquivo são aceitos?

- **Fotos**: JPEG, PNG, GIF, WebP
- **Músicas**: MP3, WAV, OGG, MP4/M4A

Arquivos de outros tipos são recusados no servidor, mesmo renomeados.

## Problemas Comuns

### ❓ Erro "Cannot connect to MongoDB"

1. Verifique se o container está rodando:

```bash
docker compose ps
```

2. Reinicie os containers:

```bash
docker compose restart
```

3. Veja os logs:

```bash
docker compose logs mongodb
```

### ❓ Erro "Port 3000 already in use"

Algo já está usando a porta 3000. Opções:

**Opção 1**: Parar o processo que usa a porta

```bash
# Linux/Mac
sudo lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Opção 2**: Alterar a porta no docker-compose.yml

```yaml
ports:
  - "3001:3000" # Acesse em localhost:3001
```

### ❓ Upload de arquivo não funciona

Os arquivos vão para o Vercel Blob, não para o disco.

1. **Em desenvolvimento**, quase sempre falta o `BLOB_READ_WRITE_TOKEN`. Com o
   Blob store já criado na Vercel:

```bash
npx vercel link
npx vercel env pull .env.local
```

2. Confira tipo e tamanho do arquivo contra os limites acima.

3. Confirme que você está logado como admin — o token de upload só é emitido
   para sessões autenticadas.

### ❓ Música não reproduz

0. Em produção, teste a URL do CDN direto:
   `curl -sI https://media.cantacrisopolis.com.br/<pathname>`.
   `500` indica `BLOB_HOST` não configurado no Worker; `404`, pathname errado
   (veja `DEPLOYMENT.md`).
1. Verifique se o arquivo foi salvo corretamente
2. Abra o console do navegador (F12) para ver erros
3. Verifique se o formato do arquivo é suportado pelo navegador
4. Tente com outro arquivo de teste

### ❓ Resultados não aparecem

O admin precisa marcar a opção "Mostrar resultados ao público" nas configurações da votação.

### ❓ Votação não aparece na lista

Verifique se a votação está marcada como "Visível" no painel admin.

## Desenvolvimento

### ❓ Como adiciono um novo campo no formulário de votação?

1. Atualize o modelo em `src/models/Voting.ts`
2. Atualize a interface TypeScript
3. Adicione o campo no formulário
4. Atualize as rotas da API

### ❓ Como altero as cores do tema?

Edite o arquivo `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#sua-cor',
    // ...
  }
}
```

### ❓ Como adiciono um novo tipo de usuário?

Você precisaria:

1. Criar um novo modelo (ex: `Moderator.ts`)
2. Adicionar campo `role` no Admin
3. Implementar verificação de permissões
4. Criar rotas específicas

### ❓ Posso usar PostgreSQL ao invés de MongoDB?

Sim, mas precisaria:

1. Substituir Mongoose por Prisma ou TypeORM
2. Reescrever todos os modelos
3. Ajustar as queries (incluindo o `$inc` atômico da contagem de votos)
4. Provisionar o PostgreSQL

## Produção

### ❓ Como faço deploy em produção?

Veja o guia completo em `DEPLOYMENT.md`.

### ❓ Preciso mudar algo antes de ir para produção?

Sim! Checklist mínimo:

- [ ] `JWT_SECRET` forte (`openssl rand -hex 32`)
- [ ] `ADMIN_USERNAME` / `ADMIN_PASSWORD` definidos, com senha forte
- [ ] Cluster no MongoDB Atlas com senha forte e Network Access liberado
- [ ] Blob store criado e conectado ao projeto na Vercel
- [ ] `media.cantacrisopolis.com.br` configurado na Cloudflare
- [ ] Backup (`mongodump`) antes e depois da apuração

HTTPS vem pronto da Vercel — não há nada a configurar.

### ❓ Quanto custa hospedar?

A configuração atual custa **US$ 0/mês**: Vercel Hobby + MongoDB Atlas M0 +
Cloudflare Free.

O que pode gerar custo conforme o volume:

- **Vercel Blob**: cobra por GB armazenado. Com a Cloudflare na frente, a saída
  de dados fica limitada aos cache MISS.
- **Atlas M0**: 512 MB e sem backup automático. Para um evento com resultado
  oficial, considere o M10 (~US$ 57/mês) ou faça `mongodump` manual.

### ❓ Suporta quantos usuários simultâneos?

As funções da Vercel escalam sozinhas, então o gargalo é o MongoDB: o Atlas M0
tem limite de 500 conexões, e cada instância de função abre um pool de até 10
(`src/lib/mongodb.ts`).

Na prática, um M0 dá conta de um concurso municipal com folga. Se a apuração for
concentrada em poucos minutos com milhares de votantes, suba para M10.

## Personalização

### ❓ Como adiciono logo personalizada?

1. Adicione seu logo em `public/logo.png`
2. Importe no layout:

```tsx
import Image from "next/image";
<Image src="/logo.png" alt="Logo" width={200} height={50} />;
```

### ❓ Como altero os textos?

Todos os textos estão nos arquivos `.tsx` das páginas. Basta editar diretamente.

### ❓ Como adiciono Google Analytics?

1. Obtenha seu ID do GA
2. Adicione no `src/app/layout.tsx`:

```tsx
<Script src={`https://www.googletagmanager.com/gtag/js?id=GA_ID`} />
```

### ❓ Posso white-label (marca branca)?

Sim! O sistema é totalmente customizável. Você pode:

- Mudar cores, logo, textos
- Remover qualquer menção ao projeto original
- Adicionar sua marca

## Segurança

### ❓ Os dados estão seguros?

O que existe hoje:

- JWT em cookie HTTP-only, `secure` em produção
- Credenciais do admin em variáveis de ambiente (não há senha no banco)
- Comparação de credenciais em tempo constante
- Validação de tipo e tamanho no upload, no servidor
- Só URLs do próprio Blob store são aceitas como mídia de uma votação
- Índice único no banco impedindo voto duplicado por dispositivo

### ❓ Alguém pode burlar o sistema de votação?

**Sim, com pouco esforço.** É importante ter isso claro antes de usar o sistema
para um resultado oficial.

O fingerprint é calculado no navegador e enviado pela aplicação — o servidor não
tem como verificar se é legítimo. Um `curl` com fingerprints aleatórios registra
quantos votos quiser, e não há rate limiting nem CAPTCHA.

O FingerprintJS OSS é uma barreira contra o votante casual que tenta votar duas
vezes, não contra fraude deliberada. Para um concurso com resultado disputado,
seria preciso acrescentar pelo menos rate limiting por IP e um CAPTCHA, ou exigir
identificação do votante.

### ❓ Como altero a senha do admin?

Edite a variável `ADMIN_PASSWORD` (em `.env.local` no local, nas Environment
Variables da Vercel em produção) e faça um novo deploy.

Os cookies já emitidos continuam válidos por até 7 dias. Para derrubar as sessões
abertas na hora, troque também o `JWT_SECRET`.

### ❓ Posso ver quem votou em quem?

Não. O sistema só armazena:

- Device fingerprint (hash)
- ID da votação
- ID da opção votada
- IP e User Agent (para auditoria)

Não há identificação pessoal dos votantes.

## Suporte

### ❓ Onde reporto bugs?

Abra uma issue no repositório do GitHub com:

- Descrição do problema
- Passos para reproduzir
- Logs de erro
- Screenshots se aplicável

### ❓ Como peço novas funcionalidades?

Abra uma issue marcada como "feature request" descrevendo:

- Qual funcionalidade você quer
- Por que ela é útil
- Como deveria funcionar

### ❓ Posso contratar suporte personalizado?

Sim! Entre em contato para discutir suas necessidades específicas.

## Performance

### ❓ Como otimizo o banco de dados?

1. Crie índices apropriados
2. Use paginação
3. Implemente cache
4. Use read replicas

### ❓ O sistema fica lento com muitos votos

Implemente:

1. Índices no MongoDB
2. Cache com Redis
3. CDN para assets
4. Load balancer para múltiplas instâncias

### ❓ Como faço backup?

Veja a seção de backup no `DEPLOYMENT.md`.

## Diversos

### ❓ Posso usar este código comercialmente?

Sim! O código está disponível para uso livre. Mas verifique a licença específica.

### ❓ Preciso dar créditos?

Não é obrigatório, mas é apreciado! 😊

### ❓ Posso contribuir com o projeto?

Sim! Pull requests são bem-vindos. Veja `CONTRIBUTING.md` se disponível.

---

## 💡 Não encontrou sua pergunta?

Abra uma issue no GitHub ou consulte a documentação completa em:

- `README.md` - Documentação geral
- `QUICKSTART.md` - Início rápido
- `DEPLOYMENT.md` - Deploy em produção
- `PROJECT_SUMMARY.md` - Resumo do projeto

**Precisa de ajuda? Entre em contato!** 📧
