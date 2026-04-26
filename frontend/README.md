# Frontend - AbrigoFacil

Aplicacao web em Next.js responsavel por:

- mapa de abrigos e disponibilidade
- gestao de abrigos (coordenador)
- check-in/check-out de pessoas
- busca de pessoas desaparecidas

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Radix UI
- Leaflet + React Leaflet

## Arquitetura Utilizada

### 1) BFF (Backend for Frontend)

O frontend nao chama diretamente o backend Express pelo browser. Em vez disso, usa Route Handlers em `src/app/api/*`.

Fluxo:

1. Componente React faz `fetch` para `/api/...` no proprio Next.js.
2. Route Handler usa `callBackend()` (`src/lib/bff.ts`).
3. O BFF injeta token (quando necessario), repassa query/body e devolve o payload original da API.

Beneficios:

- URL real do backend nao fica exposta no cliente.
- Controle centralizado de erro, serializacao e autenticacao.
- Facil trocar infraestrutura sem quebrar o app cliente.

### 2) Autenticacao por cookies

- Token JWT salvo em cookie HTTP-only: `abrigofacil.token`.
- Cookies auxiliares para UI: perfil, nome e avatar.
- Endpoints relevantes:
  - `POST /api/auth/login`
  - `GET /api/auth/session`
  - `POST /api/auth/logout`

### 3) Protecao de rotas

O arquivo `src/proxy.ts` redireciona usuarios sem token para login em:

- `/abrigos/*`
- `/checkin/*`
- `/buscar/*`

### 4) Camada de requisicoes do cliente

`src/services/request.ts` fornece um wrapper com:

- timeout
- parse seguro de resposta
- erro tipado (`FetchError`)
- retorno padronizado (data, status, headers)

## Estrutura de Pastas (resumo)

```text
src/
|- app/
|  |- (auth)/              # paginas de autenticacao
|  |- (map)/               # paginas principais do dominio
|  `- api/                 # BFF handlers para o backend
|- components/             # UI e componentes de dominio
|- lib/                    # bff, auth cookies, config server
|- services/               # cliente HTTP do frontend
`- types/                  # contratos TypeScript
```

## Logicas de Interface

- Mapa como tela principal para descoberta de abrigos.
- Tela de abrigos separada em abas (listar/adicionar), com componentes modulares.
- Cadastro de abrigo com validacao local de nome, endereco, coordenadas e capacidade.
- Controles de mapa com recentralizacao na geolocalizacao do usuario.

## Variaveis de Ambiente

Crie `frontend/.env.local`:

```env
API_BASE_URL=http://localhost:3001
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_AVATAR_BUCKET=...
```

`API_BASE_URL` e obrigatoria e usada no servidor Next para montar chamadas do BFF.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de producao
npm run start    # executa build
npm run lint     # biome check
npm run format   # biome format
```

## Executando

```bash
cd frontend
npm install
npm run dev
```

Aplicacao: `http://localhost:3000`
