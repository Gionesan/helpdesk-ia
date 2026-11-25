# Help Desk com IA

Sistema web completo para gerenciamento de chamados técnicos, desenvolvido com React, Vite, React Router DOM, Axios, Bootstrap 5, Bootstrap Icons, Node.js, Fastify, mysql2 e MySQL.

## Arquitetura

```text
Navegador
   │
   ▼
React + Vite (http://localhost:5173)
   │  Axios / REST
   ▼
Fastify (http://localhost:3333)
   │  mysql2 com pool de conexões
   ▼
MySQL / MariaDB (helpdesk_db, porta 3306)
```

Estrutura de pastas:

```text
helpdesk/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── database/
│   │   └── server.js
│   ├── test/
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

Camadas:

- `frontend/src/pages`: Dashboard, Chamados, NovoChamado, EditarChamado, Tecnicos e Categorias.
- `frontend/src/components`: Sidebar, Header, CardEstatistica, TabelaChamados e ModalConfirmacao.
- `frontend/src/services/api.js`: configuração do Axios e todas as chamadas à API.
- `backend/src/routes`: definição das rotas REST.
- `backend/src/controllers`: validações, regras de negócio e consultas SQL parametrizadas.
- `backend/src/database`: pool de conexões mysql2.
- `database/schema.sql`: banco, tabelas, chaves estrangeiras, restrições e registros para teste.

## Engenharia de Prompt

O projeto foi guiado por um prompt de desenvolvimento full stack que definiu:

- tecnologias obrigatórias e proibição de Express, Prisma e TypeScript;
- identidade visual administrativa com sidebar, header, cards, tabelas e badges;
- CRUD completo de chamados, técnicos e categorias;
- dashboard com indicadores reais do banco;
- banco `helpdesk_db` com `tecnicos`, `categorias` e `chamados`;
- rotas REST, validações, SQL parametrizado, CORS e variáveis de ambiente;
- regras de integridade, como impedir exclusão de técnico ou categoria vinculada a chamado;
- testes finais e publicação no GitHub.

## Pré-requisitos

- Node.js 20 ou superior.
- MySQL 8 ou MariaDB 10.4 (XAMPP) — ou Docker para usar o `docker-compose.yml`.

## Configurando o MySQL

### Opção A — XAMPP / MariaDB já instalado

1. Abra o XAMPP Control Panel e inicie o módulo **MySQL**.
2. Importe o script pelo terminal, na raiz do projeto:

```powershell
Get-Content .\database\schema.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
```

Ou, no phpMyAdmin, crie/importe o arquivo `database/schema.sql` na aba **Importar**.

### Opção B — Docker

```powershell
docker compose up -d
```

Nesse caso a senha do root é `rootpassword`; ajuste `DB_PASSWORD` no `.env` do backend.

O script cria o banco `helpdesk_db`, as três tabelas, os relacionamentos e registros iniciais de exemplo.

## Configurando o `.env`

No backend:

```powershell
cd backend
Copy-Item .env.example .env
```

Conteúdo padrão para XAMPP sem senha:

```env
PORT=3333
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=helpdesk_db
CORS_ORIGIN=http://localhost:5173
```

Se o frontend estiver em outra origem, inclua essa origem em `CORS_ORIGIN`, separando múltiplos valores por vírgula.

O frontend usa `VITE_API_URL` (padrão: `http://localhost:3333`). Para alterar:

```powershell
cd frontend
Copy-Item .env.example .env
```

## Executando o projeto

Terminal 1 — backend:

```powershell
cd backend
npm install
npm run dev
```

Terminal 2 — frontend:

```powershell
cd frontend
npm install
npm run dev
```

Endereços locais:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Health check: `http://localhost:3333/health`
- Documentação rápida da API: `http://localhost:3333/`

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está no ar |
| GET | `/chamados` | Lista chamados com `?search=`, `?status=` e `?prioridade=` |
| GET | `/chamados/:id` | Busca um chamado |
| POST | `/chamados` | Cadastra um chamado |
| PUT | `/chamados/:id` | Atualiza um chamado |
| DELETE | `/chamados/:id` | Exclui um chamado |
| GET | `/tecnicos` | Lista técnicos com `?search=` |
| GET | `/tecnicos/:id` | Busca um técnico |
| POST | `/tecnicos` | Cadastra um técnico |
| PUT | `/tecnicos/:id` | Atualiza um técnico |
| DELETE | `/tecnicos/:id` | Exclui técnico sem chamados vinculados |
| GET | `/categorias` | Lista categorias |
| GET | `/categorias/:id` | Busca uma categoria |
| POST | `/categorias` | Cadastra uma categoria |
| PUT | `/categorias/:id` | Atualiza uma categoria |
| DELETE | `/categorias/:id` | Exclui categoria sem chamados vinculados |
| GET | `/dashboard` | Indicadores e últimos chamados |

## Integração React × API

| Tela/Recurso | Rotas consumidas |
|---|---|
| Dashboard | `GET /dashboard` |
| Chamados (lista, filtros, pesquisa, excluir) | `GET /chamados`, `DELETE /chamados/:id` |
| Novo chamado | `GET /categorias`, `GET /tecnicos`, `POST /chamados` |
| Editar chamado | `GET /chamados/:id`, `GET /categorias`, `GET /tecnicos`, `PUT /chamados/:id` |
| Técnicos | `GET /tecnicos`, `POST /tecnicos`, `PUT /tecnicos/:id`, `DELETE /tecnicos/:id` |
| Categorias | `GET /categorias`, `POST /categorias`, `PUT /categorias/:id`, `DELETE /categorias/:id` |

## Testes

Automáticos:

```powershell
cd backend
npm test
```

O teste do backend usa o banco real e reaplica `database/schema.sql` antes de executar, por isso **ele redefine o banco `helpdesk_db`**.

```powershell
cd frontend
npm test
npm run build
```

Checklist manual:

1. Abrir `http://localhost:5173` e conferir sidebar, header e cards do dashboard.
2. Confirmar que os cinco cards mostram números vindos do banco.
3. Conferir a tabela de últimos chamados no dashboard.
4. Em **Chamados**, pesquisar por título e por solicitante.
5. Filtrar por status e por prioridade.
6. Cadastrar um chamado e conferir status inicial `Aberto` e data automática.
7. Visualizar os detalhes do chamado pelo botão de olho.
8. Editar o chamado, alterar status para `Em andamento` e depois `Concluído`.
9. Excluir um chamado e confirmar a mensagem de sucesso.
10. Em **Técnicos**, cadastrar, pesquisar, editar e excluir um técnico sem vínculo.
11. Tentar excluir um técnico vinculado a chamado e conferir o bloqueio.
12. Tentar cadastrar e-mail duplicado e conferir o bloqueio.
13. Em **Categorias**, cadastrar, editar e excluir uma categoria sem vínculo.
14. Tentar excluir uma categoria vinculada e conferir o bloqueio.
15. Acessar `http://localhost:3333/health` e conferir `{"status":"ok"}`.

## Validação executada

- Backend: 20 testes automatizados aprovados com MariaDB real.
- Frontend: 3 testes automatizados aprovados e build de produção concluído.
- Integração HTTP real: `health`, `dashboard`, listagens e CRUD com respostas 200/201/204.
- Acentuação: status `Concluído` confirmado corretamente via API UTF-8.

## Solução de problemas

| Problema | Solução |
|---|---|
| `ECONNREFUSED` no backend | Iniciar o MySQL/XAMPP ou o container Docker |
| `Unknown database 'helpdesk_db'` | Reimportar `database/schema.sql` |
| CORS no navegador | Conferir `CORS_ORIGIN` no `.env` do backend |
| `EADDRINUSE` | Liberar a porta 3333 ou 5173 |
| Frontend não carrega dados | Confirmar `VITE_API_URL` e o backend rodando |
| Erro ao excluir técnico/categoria | O registro está vinculado a chamados; essa exclusão é bloqueada pela regra de negócio |
