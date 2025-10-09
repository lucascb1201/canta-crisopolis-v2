# Guia Rápido de Inicialização

## Passos para executar o projeto:

### 1. Inicie os containers Docker:

```bash
docker-compose up -d
```

### 2. Aguarde a inicialização (cerca de 30 segundos)

### 3. Crie o usuário administrador:

```bash
docker-compose exec nextjs npm run seed
```

Ou se preferir usar ts-node diretamente:

```bash
docker-compose exec nextjs npx ts-node scripts/seed.ts
```

### 4. Credenciais de Acesso:

- **Usuário**: admin
- **Senha**: admin123
- **Email**: admin@voting.com

### 5. Acesse a aplicação:

- **Página Principal**: http://localhost:3000
- **Login Admin**: http://localhost:3000/admin/login
- **Inscrição de Candidatos**: http://localhost:3000/register

### 6. Comandos úteis:

```bash
# Ver logs
docker-compose logs -f nextjs

# Parar containers
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v

# Reconstruir imagens
docker-compose up -d --build
```

## Fluxo de Uso:

1. **Admin**: Faça login e crie uma nova votação
2. **Admin**: Adicione candidatos com fotos e músicas
3. **Público**: Acesse a página principal e vote
4. **Público**: Inscreva-se como candidato em /register
5. **Admin**: Veja os resultados e gerencie as votações

## Estrutura de Pastas de Upload:

```
public/uploads/
  ├── photos/    # Fotos dos candidatos
  └── music/     # Músicas dos candidatos
```

Esses diretórios são criados automaticamente na primeira utilização.
