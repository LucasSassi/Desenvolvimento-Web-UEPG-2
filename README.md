# Desenvolvimento-Web-UEPG-2

Aplicação para consultar o clima e a previsão do tempo por CEP brasileiro.

## Como executar

Você precisa de Node.js 22.12+ (linha 22) ou 24+, com npm.

Na raiz do projeto, abra dois terminais.

No primeiro, inicie o backend:

```bash
cd backend
npm install
npm run dev
```

No segundo, inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador. O backend roda em `http://localhost:3000`.

Execute `npm install` na primeira vez e quando as dependências mudarem. Nas próximas vezes, entre em cada pasta e execute apenas `npm run dev`. Para encerrar, use `Ctrl+C` em cada terminal.

Mais detalhes nos READMEs do [backend](backend/README.md) e do [frontend](frontend/README.md).
