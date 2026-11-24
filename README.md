# ClimaCEP

Consulta de clima por CEP, com previsão por hora, previsão de sete dias e favoritos compartilhados; sem login. Também é possível consultar o CEP correspondente ao endereço digitado.

React, Vite e Tailwind no frontend; Node.js, Express e TypeScript no backend; PostgreSQL para favoritos. Dados de ViaCEP, Open-Meteo e GeoNames.

## Executar

Requisitos: Node.js 22.12+ (linha 22) ou 24+, npm e acesso à internet.

Abra dois terminais na raiz do projeto.

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Abra a URL exibida pelo Vite, normalmente `http://localhost:5173`. Nas próximas execuções, use apenas `npm run dev` em cada pasta; para encerrar, pressione `Ctrl+C`.

Se precisar configurar as portas, use os arquivos `.env.example` como modelo para criar os `.env`: `PORT` em `backend/.env` e `BACKEND_URL` em `frontend/.env` devem apontar para a mesma porta da API (padrão `3000`; use `3001` nos dois se essa for a porta escolhida). Reinicie os servidores após alterar a configuração.

Para compilar, execute `npm run build` em cada pasta; para verificar os tipos do backend, execute `npm run typecheck` dentro de `backend/`.

## Favoritos

A consulta de clima funciona sem banco. Para usar favoritos, crie um banco PostgreSQL, configure `DATABASE_URL` em `backend/.env` e reinicie a API:

```dotenv
DATABASE_URL=postgresql://usuario:senha@localhost:5432/climacep
```

Execute uma vez no banco criado:

```sql
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cep VARCHAR(8) NOT NULL UNIQUE CHECK (cep ~ '^[0-9]{8}$'),
  name VARCHAR(80) NOT NULL CHECK (name = btrim(name) AND length(name) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Pastas e arquivos

O backend separa as rotas HTTP, a validação das requisições, as regras da aplicação, o acesso ao banco e as chamadas a serviços externos.

O frontend se baseia em FSD: `app` contém o componente raiz e os estilos, `pages` compõe as telas, `features` agrupa as funcionalidades e `shared` reúne componentes reutilizáveis. Dentro das funcionalidades, `api` faz requisições ao backend, `ui` contém componentes React e `lib` contém funções auxiliares.

A tela atual segue `main.jsx → app/App.jsx → pages/home/HomePage.jsx`, que combina previsão e favoritos. `src/App.jsx` e `features/weather/components/` são arquivos antigos ainda presentes, fora desse fluxo; os componentes atuais da previsão ficam em `features/weather/ui/`.

Os `.env` são configurações locais criadas a partir dos exemplos. A árvore omite `node_modules/` (dependências instaladas), `dist/` (arquivos gerados pelo build) e `.git/` (histórico e controle de versões).

```text
trabalho_ferrasa_2/
├── README.md — Explica como executar o projeto e a função dos arquivos.
├── backend/ — API HTTP de clima e favoritos.
│   ├── .env — Guarda as configurações locais da API e do banco.
│   ├── .env.example — Fornece um modelo das configurações.
│   ├── .gitignore — Define quais arquivos o Git deve ignorar.
│   ├── package.json — Define as dependências e os comandos do backend.
│   ├── package-lock.json — Registra as versões exatas das dependências.
│   ├── tsconfig.json — Configura a verificação e a compilação do TypeScript.
│   └── src/ — Código-fonte da API.
│       ├── app.ts — Configura o Express, o CORS, as rotas e os middlewares.
│       ├── server.ts — Inicia o servidor e encerra suas conexões ao desligar.
│       ├── clients/ — Comunicação com ViaCEP e Open-Meteo.
│       │   ├── geocoding.client.ts — Busca as coordenadas da cidade.
│       │   ├── http.client.ts — Centraliza chamadas externas, validações e tempo limite.
│       │   ├── open-meteo.client.ts — Consulta as condições atuais e a previsão.
│       │   └── viacep.client.ts — Consulta o endereço correspondente ao CEP.
│       ├── config/ — Configuração de ambiente e acesso ao banco.
│       │   ├── database.ts — Gerencia as conexões e consultas ao PostgreSQL.
│       │   └── env.ts — Carrega e valida as variáveis de ambiente.
│       ├── controllers/ — Validação das entradas HTTP e envio das respostas.
│       │   ├── favorite.controller.ts — Valida as requisições de favoritos e envia as respostas.
│       │   └── weather.controller.ts — Valida o CEP e responde com a previsão.
│       ├── errors/ — Definição dos erros da aplicação.
│       │   └── app.error.ts — Define erros com código, mensagem e status HTTP.
│       ├── middlewares/ — Tratamento dos erros encaminhados pelo Express.
│       │   └── error.middleware.ts — Converte erros em respostas padronizadas.
│       ├── repositories/ — Leitura e gravação dos favoritos com SQL.
│       │   └── favorite.repository.ts — Executa o SQL das operações de favoritos.
│       ├── routes/ — Métodos e caminhos HTTP ligados aos seus handlers.
│       │   ├── favorite.routes.ts — Define os endpoints de favoritos.
│       │   ├── health.routes.ts — Disponibiliza uma rota para verificar se a API responde.
│       │   └── weather.routes.ts — Define o endpoint de previsão por CEP.
│       ├── services/ — Regras e coordenação das consultas e dos favoritos.
│       │   ├── favorite.service.ts — Coordena as operações de favoritos e verifica o CEP no cadastro.
│       │   └── weather.service.ts — Combina endereço, coordenadas e dados meteorológicos.
│       └── types/ — Tipos TypeScript e schemas Zod para validar dados.
│           ├── favorite.types.ts — Define os tipos e as validações dos favoritos.
│           ├── location.types.ts — Define os tipos e as validações de localização.
│           └── weather.types.ts — Define os tipos e as validações meteorológicas.
└── frontend/ — Interface web em React.
    ├── .env — Guarda o endereço local do backend.
    ├── .env.example — Fornece um modelo de configuração do backend.
    ├── .gitignore — Define quais arquivos o Git deve ignorar.
    ├── index.html — Fornece o HTML onde o React monta a aplicação.
    ├── package.json — Define as dependências e os comandos do frontend.
    ├── package-lock.json — Registra as versões exatas das dependências.
    ├── vite.config.js — Configura React, Tailwind e o encaminhamento das chamadas à API.
    └── src/ — Código-fonte da interface.
        ├── main.jsx — Inicializa o React com app/App.jsx e os estilos globais.
        ├── App.jsx — Contém a versão antiga da tela, fora do fluxo atual.
        ├── app/ — Componente raiz e estilos globais da aplicação.
        │   ├── App.jsx — Renderiza a página inicial.
        │   └── styles/ — Estilos aplicados à interface inteira.
        │       └── index.css — Importa o Tailwind e define os estilos globais.
        ├── pages/ — Composição das telas com as funcionalidades.
        │   └── home/ — Página inicial de consulta e favoritos.
        │       └── HomePage.jsx — Monta a tela e controla os dados, o carregamento e os erros da previsão.
        ├── features/ — Código agrupado por funcionalidade.
        │   ├── favorites/ — Cadastro, listagem, edição e exclusão de CEPs favoritos.
        │   │   ├── api/ — Requisições HTTP dos favoritos ao backend.
        │   │   │   └── favorites.api.js — Faz as requisições de favoritos à API.
        │   │   └── ui/ — Componentes e estados da interface de favoritos.
        │   │       ├── FavoriteForm.jsx — Exibe o formulário de cadastro de favoritos.
        │   │       ├── FavoriteItem.jsx — Exibe um favorito e suas ações.
        │   │       └── Favorites.jsx — Carrega e organiza a lista e o formulário de favoritos.
        │   └── weather/ — Consulta por CEP e apresentação dos dados meteorológicos.
        │       ├── api/ — Requisição HTTP da previsão ao backend.
        │       │   └── weather.api.js — Solicita a previsão por CEP e trata erros da requisição.
        │       ├── components/ — Componentes antigos substituídos por ui/, fora do fluxo atual.
        │       │   ├── CepSearch.jsx — Contém a versão antiga do formulário de consulta.
        │       │   ├── CurrentWeather.jsx — Contém a versão antiga das condições atuais.
        │       │   ├── DailyForecast.jsx — Contém a versão antiga da previsão diária.
        │       │   └── HourlyForecast.jsx — Contém a versão antiga da previsão por hora.
        │       ├── lib/ — Funções auxiliares de formatação da previsão.
        │       │   └── formatWeather.js — Formata medições, datas e horários.
        │       └── ui/ — Componentes usados atualmente para consultar e exibir a previsão.
        │           ├── CepSearch.jsx — Exibe o formulário de consulta por CEP.
        │           ├── CurrentWeather.jsx — Mostra as condições atuais e exporta WeatherCondition para as tabelas de previsão.
        │           ├── DailyForecast.jsx — Exibe a previsão dos próximos sete dias.
        │           └── HourlyForecast.jsx — Exibe a previsão das próximas 24 horas.
        └── shared/ — Código reutilizável pelas diferentes funcionalidades.
            └── ui/ — Componentes visuais genéricos, sem regras de clima ou favoritos.
                ├── Button.jsx — Fornece um botão reutilizável com estilo padronizado.
                └── Input.jsx — Fornece um campo de entrada reutilizável com estilo padronizado.
```

systemctl is-active postgresql
sudo systemctl stop postgresql
sudo systemctl start postgresql
