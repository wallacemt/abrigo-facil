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
- Mapa interativo com **Leaflet.js** para visualização dos abrigos
- Principais páginas:
  - `/` — Mapa com abrigos e filtro por vagas disponíveis
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

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Back-end

```bash
cd backend
npm install
cp .env.example .env
# Preencher variáveis no .env (DB, JWT_SECRET, PORT)
npm run migrate   # Executa o schema SQL
npm run dev
```

### Front-end

```bash
cd frontend
npm install
cp .env.example .env.local
# Preencher API_BASE_URL apontando para o back-end
npm run dev
```

---

## Variáveis de Ambiente

### Back-end (`.env`)

```env
PORT=3001
DATABASE_URL=postgresql://usuario:senha@localhost:5432/abrifacil
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Front-end (`.env.local`)

```env
API_BASE_URL=http://localhost:3001
```

> A variável `API_BASE_URL` é usada apenas server-side no Next.js. O browser nunca acessa a API diretamente.

---

## Documentação da API

A documentação completa dos endpoints está disponível na **collection do Postman** incluída no repositório:

```
docs/AbriFacil.postman_collection.json
```

Importe o arquivo no Postman para acessar todos os endpoints com exemplos de request/response.

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js 14, Tailwind CSS, shadcn + shadcn-map |
| Back-end | Node.js, Express |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT + Argon2id |
| Validação | Zod |
| Segurança | Helmet |
| HTTP Client (SSR) | fetch nativo (Next.js server-side) |

---

## Licença

MIT
