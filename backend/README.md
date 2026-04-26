# Backend - AbrigoFacil API

API REST para operacao de abrigos e localizacao de pessoas em contexto de enchentes.

> Postmand Docs (https://documenter.getpostman.com/view/34540840/2sBXqGrN67)
## Stack

- Node.js + Express 5
- TypeScript
- PostgreSQL (`pg`)
- JWT + Argon2id
- Zod para validacao
- Pino + Morgan para logs

## Como a API esta organizada

Padrao aplicado:

- `routes/`: define endpoints e middlewares por recurso
- `controllers/`: transforma entrada HTTP em chamada de servico
- `services/`: regras de negocio e transacoes
- `models/`: queries SQL e acesso ao banco
- `schemas/`: validacoes Zod de body/query/params

## Pipeline de Requisicao

1. Requisicao entra em `app.ts` com `helmet`, `cors`, `compression`, `rate-limit` e parsers.
2. Rota aplica middlewares especificos (`authMiddleware`, `authorizeRoles`, `validate`).
3. Controller chama Service.
4. Service aplica regras de negocio e usa Model.
5. Model executa SQL no Postgres.
6. Erros seguem para `errorHandler` com payload padronizado.

## Regras de Negocio Implementadas

### Auth

- Registro com email unico.
- Senha hash com Argon2id.
- Login gera JWT com `id`, `nome`, `email` e `perfil`.

### Abrigos

- Apenas `coordenador` cria/atualiza/desativa abrigo.
- Abrigo criado guarda `criado_por_usuario_id`.
- Atualizar vagas e desativar exige que o coordenador seja o criador do abrigo.
- Lista publica retorna apenas abrigos ativos.
- Lista pode calcular distancia por `lat/lng` e filtrar por vagas.

### Pessoas

- Cadastro inicia com status `desaparecida`.
- Busca por nome com `ILIKE` e retorno de abrigo atual, quando houver check-in ativo.

### Check-in

- Check-in exige pessoa existente e sem check-in ativo.
- Codigo de abrigo valido e necessario.
- Operacao transacional:
    - decrementa vaga
    - cria check-in
    - atualiza pessoa para `em_abrigo`
- Check-out tambem transacional:
    - encerra check-in
    - atualiza pessoa para `encontrada`
    - incrementa vaga

## Formato de Resposta

### Sucesso

```json
{
	"status": "success",
	"data": {}
}
```

### Erro

```json
{
	"status": "error",
	"message": "Dados de entrada invalidos.",
	"errors": [{ "field": "campo", "message": "mensagem" }]
}
```

`errors` aparece principalmente em falhas de validacao Zod.

## Endpoints principais

Base: `/api`

- `GET /health`
- `GET /status`
- `POST /auth/register`
- `POST /auth/login`
- `GET /abrigos`
- `GET /abrigos/:id`
- `POST /abrigos`
- `PATCH /abrigos/:id/vagas`
- `PATCH /abrigos/:id/desativar`
- `GET /pessoas/buscar`
- `POST /pessoas`
- `POST /checkin`
- `PATCH /checkin/:id/saida`

Documentacao detalhada com exemplos: `../docs/backend-api.md`

## Banco de Dados

Arquivo base de schema: `src/migrations/001_schema.sql`.

Entidades principais:

- `usuarios`
- `abrigos`
- `pessoas`
- `checkins`

## Variaveis de Ambiente

Crie `backend/.env`:

```env
NODE_ENV=development
DATABASE_URL=postgresql://usuario:senha@localhost:5432/abrigofacil
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
SERVER_HOST=localhost
LOG_LEVEL=info
IS_PRODUCTION=false
```

Observacao: `CORS_ORIGIN` ou `FRONTEND_URL` deve existir.

## Scripts

```bash
npm run dev       # servidor com watch (tsx)
npm run build     # compila TypeScript + tsc-alias
npm run start     # executa dist/server.js via bun
npm run migrate   # aplica migrations em src/migrations
npm run seed      # popula dados iniciais
npm run lint      # eslint --fix
npm run format    # prettier
```

## Executando localmente

```bash
cd backend
npm install
npm run migrate
npm run dev
```

API em: `http://localhost:3001`
