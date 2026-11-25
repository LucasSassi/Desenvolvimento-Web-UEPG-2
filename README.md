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

O backend usa arquitetura em camadas: as rotas encaminham as requisições aos controllers, que validam as entradas e chamam os services. Os services coordenam as regras da aplicação e usam clients para consultar APIs externas ou o repository para acessar os favoritos no PostgreSQL. As rotas são montadas sob o prefixo `/api`.

O frontend tem uma organização inspirada em Feature-Sliced Design (FSD): `app` contém o componente raiz e os estilos, `pages` compõe as telas, `features` agrupa as funcionalidades e `shared` reúne componentes reutilizáveis. Dentro das funcionalidades, `api` faz requisições ao backend, `ui` contém componentes React e `lib` contém funções auxiliares.

A tela atual segue `main.jsx → app/App.jsx → pages/home/HomePage.jsx`, que combina previsão e favoritos. `src/App.jsx` e `features/weather/components/` são arquivos antigos ainda presentes, fora desse fluxo; os componentes atuais da previsão ficam em `features/weather/ui/`.

Os `.env` são configurações locais criadas a partir dos exemplos e ignoradas pelo Git. A árvore inclui esses arquivos locais e os arquivos-fonte e de configuração; omite `node_modules/` (dependências instaladas), `dist/` (arquivos gerados pelo build) e `.git/` (histórico e controle de versões). A previsão é calculada para a cidade do CEP; os favoritos são compartilhados por todos os usuários desta instalação, sem autenticação.

```text
trabalho_ferrasa_2/
├── README.md — Explica como executar o projeto e a função dos arquivos.
├── backend/ — API HTTP de clima e favoritos.
│   ├── .env — Configura localmente porta, origem CORS, tempo limite HTTP e conexão opcional com o banco.
│   ├── .env.example — Modelo das variáveis PORT, CORS_ORIGIN, HTTP_TIMEOUT_MS e DATABASE_URL.
│   ├── .gitignore — Define quais arquivos o Git deve ignorar.
│   ├── package.json — Define as dependências e os comandos do backend.
│   ├── package-lock.json — Registra as versões exatas das dependências.
│   ├── tsconfig.json — Configura a verificação e a compilação do TypeScript.
│   └── src/ — Código-fonte da API.
│       ├── app.ts — Configura Express e CORS, monta as rotas em /api e registra o tratamento de rota inexistente e de erros.
│       ├── server.ts — Inicia o servidor HTTP e coordena o encerramento dele e do pool PostgreSQL em SIGINT ou SIGTERM.
│       ├── clients/ — Comunicação com ViaCEP e Open-Meteo.
│       │   ├── geocoding.client.ts — Busca cidades brasileiras e suas coordenadas no Open-Meteo Geocoding.
│       │   ├── http.client.ts — Executa chamadas HTTP externas, aplica tempo limite, valida o JSON com Zod e padroniza falhas.
│       │   ├── open-meteo.client.ts — Consulta condições atuais e previsões horárias e diárias de sete dias por coordenadas.
│       │   └── viacep.client.ts — Consulta endereço por CEP e busca endereços por UF, cidade e logradouro no ViaCEP.
│       ├── config/ — Configuração de ambiente e acesso ao banco.
│       │   ├── database.ts — Cria o pool PostgreSQL sob demanda, executa consultas e traduz falhas de conexão e de CEP duplicado.
│       │   └── env.ts — Carrega o .env com dotenv e valida as configurações com Zod, aplicando valores padrão.
│       ├── controllers/ — Validação das entradas HTTP e envio das respostas.
│       │   ├── favorite.controller.ts — Valida IDs e corpos de cadastro/edição, chama o service e responde às operações de favoritos.
│       │   └── weather.controller.ts — Valida o CEP ou os parâmetros de busca por endereço, chama o service e retorna JSON.
│       ├── errors/ — Definição dos erros da aplicação.
│       │   └── app.error.ts — Define erros com código, mensagem e status HTTP.
│       ├── middlewares/ — Tratamento dos erros encaminhados pelo Express.
│       │   └── error.middleware.ts — Retorna erros em JSON com código e mensagem; trata AppError, JSON inválido, corpo excessivo e falhas inesperadas.
│       ├── repositories/ — Leitura e gravação dos favoritos com SQL.
│       │   └── favorite.repository.ts — Lista, insere, renomeia e exclui favoritos com SQL parametrizado e converte registros para o formato da API.
│       ├── routes/ — Métodos e caminhos HTTP ligados aos seus handlers.
│       │   ├── favorite.routes.ts — Define GET/POST /favorites e PATCH/DELETE /favorites/:id; limita o corpo JSON a 10 KB.
│       │   ├── health.routes.ts — Define GET /health para verificar a resposta da API, sem testar banco ou serviços externos.
│       │   └── weather.routes.ts — Define GET /weather/:cep e GET /weather/cep/search para previsão e busca de CEP por endereço.
│       ├── services/ — Regras e coordenação das consultas e dos favoritos.
│       │   ├── favorite.service.ts — Valida a existência do CEP no ViaCEP ao cadastrar e trata favoritos inexistentes ao editar ou excluir.
│       │   └── weather.service.ts — Busca CEPs por endereço ou combina endereço, identificação da cidade e previsão; retorna até 24 horários e sete dias, incluindo hoje.
│       └── types/ — Tipos TypeScript e schemas Zod para validar dados.
│           ├── favorite.types.ts — Define o tipo de favorito e schemas Zod para cadastro, edição do nome e ID.
│           ├── location.types.ts — Define UFs, tipos de localização e schemas das respostas do ViaCEP e da geocodificação.
│           └── weather.types.ts — Define o contrato da previsão e valida a resposta meteorológica, incluindo tamanhos e ordem das séries.
└── frontend/ — Interface web em React.
    ├── .env — Define BACKEND_URL, destino do proxy /api do servidor de desenvolvimento Vite.
    ├── .env.example — Modelo da variável BACKEND_URL para configurar o proxy de desenvolvimento.
    ├── .gitignore — Define quais arquivos o Git deve ignorar.
    ├── index.html — Fornece o HTML onde o React monta a aplicação.
    ├── package.json — Define as dependências e os comandos do frontend.
    ├── package-lock.json — Registra as versões exatas das dependências.
    ├── vite.config.js — Ativa React e Tailwind, define a porta de desenvolvimento e encaminha /api ao backend durante o desenvolvimento.
    └── src/ — Código-fonte da interface.
        ├── main.jsx — Monta app/App.jsx no elemento root com StrictMode e importa os estilos globais.
        ├── App.jsx — Contém a versão antiga da tela, fora do fluxo atual.
        ├── app/ — Componente raiz e estilos globais da aplicação.
        │   ├── App.jsx — Renderiza a página inicial.
        │   └── styles/ — Estilos aplicados à interface inteira.
        │       └── index.css — Importa o Tailwind e define os estilos globais.
        ├── pages/ — Composição das telas com as funcionalidades.
        │   └── home/ — Página inicial de consulta e favoritos.
        │       └── HomePage.jsx — Compõe busca e favoritos, valida o CEP e controla dados, carregamento e erros da consulta de previsão.
        ├── features/ — Código agrupado por funcionalidade.
        │   ├── favorites/ — Cadastro, listagem, edição e exclusão de CEPs favoritos.
        │   │   ├── api/ — Requisições HTTP dos favoritos ao backend.
        │   │   │   └── favorites.api.js — Encapsula listagem, cadastro, edição do nome e exclusão via /api/favorites e traduz erros para a interface.
        │   │   └── ui/ — Componentes e estados da interface de favoritos.
        │   │       ├── FavoriteForm.jsx — Valida CEP e nome, envia o cadastro e informa o favorito criado ao componente pai.
        │   │       ├── FavoriteItem.jsx — Exibe um favorito, permite consultar a previsão, editar o nome e confirmar a exclusão.
        │   │       └── Favorites.jsx — Carrega a lista, cancela a requisição ao desmontar e atualiza o estado após cadastro, edição ou exclusão.
        │   └── weather/ — Consulta por CEP e apresentação dos dados meteorológicos.
        │       ├── api/ — Requisições de previsão por CEP e busca de CEPs por endereço ao backend.
        │       │   └── weather.api.js — Consulta /api/weather/:cep e /api/weather/cep/search e traduz erros para a interface.
        │       ├── components/ — Componentes antigos substituídos por ui/, fora do fluxo atual.
        │       │   ├── CepSearch.jsx — Contém a versão antiga do formulário de consulta.
        │       │   ├── CurrentWeather.jsx — Contém a versão antiga das condições atuais.
        │       │   ├── DailyForecast.jsx — Contém a versão antiga da previsão diária.
        │       │   └── HourlyForecast.jsx — Contém a versão antiga da previsão por hora.
        │       ├── lib/ — Funções auxiliares de formatação da previsão.
        │       │   └── formatWeather.js — Formata medições, datas e horários.
        │       └── ui/ — Componentes usados atualmente para consultar e exibir a previsão.
        │           ├── AddressCepFinder.jsx — Busca CEPs por UF, cidade e logradouro e permite selecionar um resultado.
        │           ├── CepSearch.jsx — Aplica máscara ao CEP, envia a consulta e abre a busca por endereço; ao selecionar um CEP, inicia a consulta.
        │           ├── CurrentWeather.jsx — Exibe localização e condições atuais; exporta WeatherCondition, que converte códigos meteorológicos em ícones e descrições.
        │           ├── DailyForecast.jsx — Exibe até sete dias, incluindo hoje, com mínimas, máximas, condição e chance de chuva.
        │           └── HourlyForecast.jsx — Exibe até 24 horários locais com temperatura, condição, chance e volume de chuva e índice UV.
        └── shared/ — Código reutilizável pelas diferentes funcionalidades.
            └── ui/ — Componentes visuais genéricos, sem regras de clima ou favoritos.
                ├── Button.jsx — Fornece um botão reutilizável com estilo padronizado.
                └── Input.jsx — Fornece um campo de entrada reutilizável com estilo padronizado.
```

systemctl is-active postgresql
sudo systemctl stop postgresql
sudo systemctl start postgresql
