# AbrigoFácil

> Plataforma de localização de abrigos e busca de desaparecidos em situações de enchente.

---

## Apresentação da Ideia

A ideia surgiu a partir do desafio técnico sobre enchentes no Brasil. Pensando nesse cenário, decidi focar na combinação de dois problemas críticos: a **falta de informação sobre abrigos disponíveis** e a **dificuldade de localizar pessoas desaparecidas**. A percepção central é que, se cada pessoa faz check-in ao chegar em um abrigo, esse dado resolve os dois problemas simultaneamente — mostra a disponibilidade do abrigo e permite que familiares localizem pessoas desaparecidas cruzando as informações.

---

## Problema Escolhido

Combinação dos casos **1 (Abrigos)** e **3 (Pessoas Desaparecidas)**:

- Pessoas precisam encontrar abrigos com vagas próximos, em tempo real
- Famílias separadas durante a emergência precisam localizar seus membros
- Informações existem mas estão dispersas em redes sociais e grupos de mensagens

---

## Solução Proposta

O **AbrigoFácil** é uma plataforma web com mapa interativo onde:

1. **Abrigos** são cadastrados com localização, capacidade e vagas disponíveis
2. **Voluntários** registram o check-in de pessoas ao chegarem nos abrigos
3. **Familiares** buscam pessoas desaparecidas pelo nome — o sistema cruza automaticamente com os registros de check-in
4. O **mapa** exibe todos os abrigos ativos com indicação visual de disponibilidade de vagas

---

## Estrutura do Sistema

### Front-end — Next.js (App Router)

- Interface web responsiva construída com **Next.js 14+**
- Comunicação com a API realizada via **Server Actions / Route Handlers** (server-side), mantendo o front-end desacoplado do back-end
- O Next.js atua como BFF (Backend for Frontend), fazendo as chamadas HTTP para a API Express a partir do servidor, sem expor a URL da API diretamente ao browser
- Mapa interativo com **chadcn/map** para visualização dos abrigos
- Principais páginas:
  - `/map` — Mapa com abrigos e filtro por vagas disponíveis
  - `/abrigos` — Listagem e cadastro de abrigos
  - `/checkin` — Registro de chegada de pessoa em abrigo
  - `/buscar` — Busca de pessoas desaparecidas por nome

### Back-end — Node.js + Express (MVC)

- API REST estruturada no padrão **MVC** (Models, Controllers, Routes)
- Autenticação com **JWT** + senhas criptografadas com **Argon2id**
- Validação de entrada com **Zod**
- Segurança de headers HTTP com **Helmet**
- Sem ORM — queries diretas via **`pg`** (node-postgres)
- Estrutura de diretórios:

```
backend/
├── src/
│   ├── config/         # Configuração do banco (pg pool)
│   ├── controllers/    # Lógica de negócio por domínio
│   ├── models/         # Queries SQL por entidade
│   ├── routes/         # Definição das rotas Express
│   ├── middlewares/    # Auth, validação, error handler
│   ├── schemas/        # Schemas Zod por recurso
│   └── app.js          # Setup do Express (helmet, cors, rotas)
├── server.js           # Entry point
└── .env
```

### Banco de Dados — PostgreSQL

Quatro tabelas principais com relacionamentos via chaves estrangeiras:

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Contas de voluntários e coordenadores |
| `abrigos` | Locais cadastrados com geolocalização e vagas |
| `pessoas` | Registro de pessoas (chegadas ou reportadas como desaparecidas) |
| `checkins` | Vínculo entre pessoa e abrigo com timestamps |

---

## Como Rodar Localmente

### Pre-requisitos

- Node.js 18+
- Bun (scripts de migration/seed usam `bun run`)
- PostgreSQL 15+

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# configure DATABASE_URL, JWT_SECRET, FRONTEND_URL/CORS_ORIGIN
npm run migrate
npm run dev
```

Servidor padrao: `http://localhost:3001`

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# configure API_BASE_URL=http://localhost:3001
npm run dev
```

Aplicacao padrao: `http://localhost:3000`

## Variaveis de Ambiente (Resumo)

### Backend (`backend/.env`)

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

Observacao: e obrigatorio definir `CORS_ORIGIN` ou `FRONTEND_URL`.

### Frontend (`frontend/.env.local`)

```env
API_BASE_URL=http://localhost:3001
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_AVATAR_BUCKET=...
```


## Documentacao

- Guia da API backend: `docs/backend-api.md`
- README backend: `backend/README.md`
- README frontend: `frontend/README.md`
---

## Documentação da API

A documentação completa dos endpoints está disponível na **collection do Postman** incluída no repositório:

```
docs/AbrigoFacil.postman_collection.json
```

Importe o arquivo no Postman para acessar todos os endpoints com exemplos de request/response.

---

## Tecnologias

| Camada          | Stack                                                 |
| --------------- | ----------------------------------------------------- |
| Frontend        | Next.js 16, React 19, Tailwind CSS, Radix UI, Leaflet |
| Backend         | Node.js, Express 5, TypeScript                        |
| Banco           | PostgreSQL                                            |
| Auth            | JWT + Argon2id                                        |
| Validacao       | Zod                                                   |
| Observabilidade | Pino + Morgan                                         |

## Licenca

MIT