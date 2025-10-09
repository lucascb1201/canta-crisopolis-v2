# Guia de Deploy em Produção 🚀

## Checklist de Segurança

Antes de fazer deploy em produção, certifique-se de:

### ✅ Variáveis de Ambiente

- [ ] Alterar `JWT_SECRET` para um valor seguro e aleatório (mínimo 32 caracteres)
- [ ] Alterar senha do MongoDB
- [ ] Configurar `NEXT_PUBLIC_API_URL` com o domínio real
- [ ] Configurar `NODE_ENV=production`

### ✅ MongoDB

- [ ] Usar MongoDB Atlas ou servidor dedicado (não usar container em produção)
- [ ] Ativar autenticação
- [ ] Configurar backup automático
- [ ] Restringir acesso por IP

### ✅ Aplicação

- [ ] Alterar senha do admin padrão
- [ ] Configurar HTTPS/SSL
- [ ] Implementar rate limiting
- [ ] Configurar logs de produção
- [ ] Implementar monitoramento

### ✅ Upload de Arquivos

- [ ] Considerar usar AWS S3, Cloudinary ou similar
- [ ] Configurar limite de tamanho de arquivo
- [ ] Validar tipos de arquivo
- [ ] Implementar antivírus scan

### ✅ Performance

- [ ] Ativar cache
- [ ] Configurar CDN
- [ ] Otimizar imagens
- [ ] Minificar assets

## Opções de Deploy

### 1. Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Configure as variáveis de ambiente no dashboard da Vercel
# MongoDB: Use MongoDB Atlas
```

**Vantagens:**

- Deploy automático via Git
- SSL gratuito
- CDN global
- Fácil configuração

**Desvantagens:**

- Precisa de MongoDB externo
- Limite de tamanho de arquivos (usar S3 para uploads)

### 2. Docker + VPS (DigitalOcean, AWS EC2, etc.)

```bash
# No servidor
git clone <seu-repo>
cd voting

# Configurar .env
nano .env

# Ajustar docker-compose para produção
# docker-compose.prod.yml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - voting-network

  nextjs:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongodb
    networks:
      - voting-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - nextjs
    networks:
      - voting-network

volumes:
  mongodb_data:

networks:
  voting-network:
    driver: bridge
```

**Dockerfile.prod:**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**nginx.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server nextjs:3000;
    }

    server {
        listen 80;
        server_name seu-dominio.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name seu-dominio.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Upload limits
        client_max_body_size 10M;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Cache static files
        location /_next/static {
            proxy_pass http://nextjs;
            proxy_cache_valid 60m;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 3. Kubernetes

Para ambientes enterprise com alta disponibilidade.

### 4. Heroku

```bash
# Instalar Heroku CLI
npm i -g heroku

# Login
heroku login

# Criar app
heroku create seu-app-voting

# Adicionar MongoDB
heroku addons:create mongolab

# Configure variáveis
heroku config:set JWT_SECRET=seu-secret-aqui
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## Configuração de SSL/HTTPS

### Let's Encrypt (Gratuito)

```bash
# Instalar certbot
sudo apt-get update
sudo apt-get install certbot

# Obter certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Certificados ficam em:
# /etc/letsencrypt/live/seu-dominio.com/
```

## MongoDB Atlas (Recomendado)

1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Criar cluster gratuito (M0)
3. Criar usuário do banco
4. Whitelist IPs (ou 0.0.0.0/0 para qualquer IP)
5. Obter connection string
6. Configurar no .env:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/voting?retryWrites=true&w=majority
```

## AWS S3 para Uploads

1. Criar bucket S3
2. Configurar permissões públicas de leitura
3. Instalar SDK:

```bash
npm install aws-sdk
```

4. Modificar `/src/lib/upload.ts`:

```typescript
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function saveFile(
  file: File,
  type: "photo" | "music"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name);
  const filename = `${type}/${randomUUID()}${ext}`;

  await s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    })
    .promise();

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}
```

## Monitoramento

### Logs

Use um serviço de logs como:

- Papertrail
- Loggly
- DataDog
- New Relic

### Uptime Monitoring

- UptimeRobot (gratuito)
- Pingdom
- StatusCake

### Performance Monitoring

- Vercel Analytics
- Google Analytics
- Sentry (para errors)

## Backup

### MongoDB

```bash
# Backup manual
mongodump --uri="mongodb://user:pass@host:port/voting" --out=/backup

# Restore
mongorestore --uri="mongodb://user:pass@host:port/voting" /backup/voting
```

### Automatizar com cron

```bash
# Editar crontab
crontab -e

# Adicionar backup diário às 3am
0 3 * * * /usr/bin/mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y-\%m-\%d)
```

## Escala

### Horizontal Scaling

- Use load balancer (nginx, HAProxy)
- Multiple instances do Next.js
- Shared session store (Redis)

### Database Scaling

- MongoDB replica set
- Read replicas
- Sharding para grandes volumes

## Segurança Adicional

1. **Helmet.js** para headers de segurança
2. **Rate Limiting** com express-rate-limit
3. **CORS** configurado corretamente
4. **CSP** (Content Security Policy)
5. **XSS Protection**
6. **SQL Injection** (já protegido pelo Mongoose)

## Custo Estimado (mensal)

### Opção Econômica

- Vercel: $0 (hobby)
- MongoDB Atlas: $0 (M0)
- Cloudinary: $0 (free tier)
- **Total: $0/mês** (até 100GB bandwidth)

### Opção Profissional

- VPS (DigitalOcean): $12/mês
- MongoDB Atlas M10: $57/mês
- AWS S3: ~$5/mês
- Cloudflare CDN: $0
- **Total: ~$74/mês**

### Opção Enterprise

- AWS/GCP/Azure: $200-1000+/mês
- Managed MongoDB: $200+/mês
- CDN Premium: $50+/mês
- **Total: $450+/mês**

## Checklist Final de Deploy

- [ ] Testar localmente em modo produção
- [ ] Configurar todas as variáveis de ambiente
- [ ] Testar uploads de arquivo
- [ ] Testar sistema de votação
- [ ] Verificar device fingerprinting
- [ ] Testar em múltiplos navegadores
- [ ] Testar em mobile
- [ ] Configurar SSL
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Testar performance
- [ ] Documentar processo de deploy
- [ ] Criar runbook de troubleshooting

---

**Boa sorte com o deploy! 🚀**
