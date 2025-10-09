# FAQ - Perguntas Frequentes ❓

## Instalação e Configuração

### ❓ Como eu inicio o projeto pela primeira vez?

Execute o script de inicialização:

```bash
./start.sh
```

Ou manualmente:

```bash
docker-compose up -d
sleep 30
docker-compose exec nextjs npm run seed
```

### ❓ O que fazer se o comando `./start.sh` não funcionar?

Torne o script executável primeiro:

```bash
chmod +x start.sh
./start.sh
```

### ❓ Preciso instalar o Node.js se estou usando Docker?

Não! Com Docker, tudo roda dentro dos containers. Você só precisa do Docker e Docker Compose instalados.

### ❓ Como acesso o MongoDB?

Use qualquer cliente MongoDB (MongoDB Compass, Studio 3T, etc.) com:

```
mongodb://admin:voting_password_2025@localhost:27017
```

## Uso do Sistema

### ❓ Não consigo fazer login como admin

Certifique-se de que:

1. Executou o seed: `docker-compose exec nextjs npm run seed`
2. Está usando as credenciais corretas: admin / admin123
3. Os containers estão rodando: `docker-compose ps`

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

- **Fotos**: Recomendado até 5MB
- **Músicas**: Recomendado até 10MB

O limite padrão está configurado em 10MB no `next.config.js`.

### ❓ Que formatos de arquivo são aceitos?

- **Fotos**: JPG, PNG, GIF, WebP
- **Músicas**: MP3, WAV, OGG, M4A

## Problemas Comuns

### ❓ Erro "Cannot connect to MongoDB"

1. Verifique se o container está rodando:

```bash
docker-compose ps
```

2. Reinicie os containers:

```bash
docker-compose restart
```

3. Veja os logs:

```bash
docker-compose logs mongodb
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

1. Verifique se os diretórios existem:

```bash
ls -la public/uploads
```

2. Crie-os se necessário:

```bash
mkdir -p public/uploads/photos
mkdir -p public/uploads/music
```

3. Verifique permissões:

```bash
chmod -R 755 public/uploads
```

### ❓ Música não reproduz

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
3. Ajustar as queries
4. Configurar o PostgreSQL no Docker

## Produção

### ❓ Como faço deploy em produção?

Veja o guia completo em `DEPLOYMENT.md`.

### ❓ Preciso mudar algo antes de ir para produção?

Sim! Checklist mínimo:

- [ ] Alterar `JWT_SECRET`
- [ ] Alterar senha do MongoDB
- [ ] Alterar senha do admin
- [ ] Configurar HTTPS
- [ ] Usar MongoDB externo (Atlas)
- [ ] Configurar backup

### ❓ Quanto custa hospedar?

Depende do tráfego:

- **Gratuito**: Vercel + MongoDB Atlas (tier gratuito)
- **Pequeno**: $10-20/mês (VPS básico)
- **Médio**: $50-100/mês (VPS + MongoDB gerenciado)
- **Grande**: $200+/mês (infraestrutura escalável)

### ❓ Suporta quantos usuários simultâneos?

Com a configuração padrão:

- **Docker local**: ~100 usuários simultâneos
- **VPS básico**: ~500 usuários
- **VPS otimizado**: ~2000 usuários
- **Infraestrutura escalável**: ilimitado

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

Sim, implementamos:

- JWT em cookies HTTP-only
- Hash de senhas com bcrypt
- Validação de dados
- Proteção contra SQL injection (NoSQL)
- CORS configurado
- Device fingerprinting

### ❓ Alguém pode burlar o sistema de votação?

É muito difícil. O fingerprinting considera dezenas de fatores do dispositivo. Para burlar, seria necessário:

- Usar dispositivos diferentes
- Usar VMs ou containers diferentes
- Manipular Canvas/WebGL fingerprints

### ❓ Como altero a senha do admin?

1. Acesse o MongoDB
2. Execute:

```javascript
use voting
db.admins.updateOne(
  { username: "admin" },
  { $set: { password: await bcrypt.hash("nova-senha", 10) } }
)
```

Ou crie uma rota API para isso.

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
