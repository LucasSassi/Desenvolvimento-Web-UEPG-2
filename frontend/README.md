# ClimaCEP — Frontend

Interface simples para consultar condições atuais e previsão do tempo por CEP brasileiro.

## Tecnologias

React com JavaScript (JSX) e Tailwind CSS v4. O Vite executa o projeto em desenvolvimento e gera o build. Os componentes usam `useState` para os estados e `useId` para associar o campo de CEP ao rótulo e à instrução acessível.

Requisito: Node.js 22.12+ (linha 22) ou 24+, com npm.

## Como executar

Na raiz do repositório, abra dois terminais.

No primeiro, inicie o backend:

```bash
cd backend
npm ci
npm run dev
```

No segundo, inicie o frontend:

```bash
cd frontend
npm ci
npm run dev
```

Abra a URL exibida pelo Vite, normalmente `http://localhost:5173`. O comando `npm ci` instala as dependências e pode ser omitido quando elas já estiverem instaladas e atualizadas.

## Configuração do backend

O proxy usa `http://localhost:3000` por padrão. Para mudar a URL ou porta, dentro de `frontend/`:

```bash
cp .env.example .env
```

Edite `.env` e reinicie o Vite:

```dotenv
BACKEND_URL=http://localhost:4000
```

O cliente consulta somente `GET /api/weather/:cep`. O proxy em `vite.config.js` encaminha `/api` ao Express. As integrações com ViaCEP e Open-Meteo continuam exclusivamente no backend.

## Organização

```text
frontend/
├── src/
│   ├── App.jsx
│   ├── features/weather/
│   │   ├── api/weather.api.js
│   │   ├── formatWeather.js
│   │   └── components/
│   │       ├── CepSearch.jsx
│   │       ├── CurrentWeather.jsx
│   │       ├── HourlyForecast.jsx
│   │       └── DailyForecast.jsx
│   ├── shared/components/
│   │   ├── Button.jsx
│   │   └── Input.jsx
│   ├── styles/index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

Os arquivos da funcionalidade de previsão ficam juntos em `features/weather/`. Não há pastas de páginas, hooks personalizados ou cliente HTTP compartilhado: a aplicação tem uma única tela e uma única consulta.

- `App.jsx` organiza a tela e controla os dados, o carregamento e o erro com `useState`.
- `api/weather.api.js` contém a função assíncrona `getWeatherByCep(cep)` e as mensagens dos erros da API. Toda comunicação HTTP fica nessa pasta da feature.
- `components/CepSearch.jsx` guarda o texto digitado e avisa o `App` quando o formulário é enviado.
- Os demais componentes apresentam as condições atuais e as previsões recebidas por propriedades.
- `formatWeather.js` tem funções curtas para formatar medições, datas e horários. Os componentes preparam os valores antes do `return`, deixando o JSX dedicado à interface.
- `shared/components/` contém elementos de interface que podem ser usados por qualquer feature, como `Button` e `Input`. Eles centralizam os estilos básicos e recebem as propriedades normais dos elementos HTML.

### Componentes compartilhados

Use `shared/components/` para elementos universais, sem regras de CEP ou previsão do tempo. Os componentes específicos da consulta continuam em `features/weather/components/`, e as chamadas HTTP continuam em `features/weather/api/`.

O formulário `CepSearch` já usa os dois componentes compartilhados:

```jsx
<Input
  id={inputId}
  value={cep}
  onChange={handleCepChange}
  disabled={isLoading}
  className="w-48"
/>
<Button type="submit" disabled={isLoading}>
  Consultar
</Button>
```

`Button` usa `type="button"` por padrão para evitar envios acidentais de formulários. Para enviar o formulário, informe `type="submit"`. `Input` usa `type="text"` por padrão. Ambos aceitam `className` para acrescentar estilos ao padrão. As demais propriedades (`...props`), como `onClick`, `onChange`, `disabled`, `id` e atributos `aria-*`, são encaminhadas ao elemento HTML, preservando os eventos e os recursos de acessibilidade.

## Como funciona a consulta GET

Fluxo: **formulário → função do componente → GET na API da feature → estado → interface**.

1. O usuário digita o CEP em `CepSearch` e clica em **Consultar** ou pressiona Enter. A função `handleSubmit` impede o recarregamento da página com `event.preventDefault()` e chama `onSearch(cep)`.
2. Essa propriedade aponta para `searchWeather`, no `App`. A função limpa o resultado anterior, remove espaços nas pontas e valida oito dígitos, com ou sem hífen. Se o CEP for inválido, atualiza a mensagem de erro e não faz requisição.
3. Para um CEP válido, `searchWeather` remove o hífen, ativa o carregamento e executa `await getWeatherByCep(cep)` dentro de um `try`.
4. Em `features/weather/api/weather.api.js`, `getWeatherByCep` chama `fetch` com `method: 'GET'` explícito, no endereço `/api/weather/84010000`, por exemplo. Ela aguarda a resposta e a leitura do JSON com `await`, verifica `response.ok` e retorna os dados. Se houver falha de conexão, JSON inválido ou uma resposta HTTP de erro, lança um `Error` com uma mensagem compreensível.
5. No `App`, o `try` salva os dados com `setWeather`. O `catch` salva a mensagem com `setError`. O `finally` encerra o carregamento com `setIsLoading(false)`, tanto no sucesso quanto no erro.
6. O React atualiza a interface a partir desses estados: mostra o carregamento, anuncia erros com `role="alert"` ou apresenta as condições atuais e as tabelas.

Enquanto a consulta estiver em andamento, o campo e o botão ficam desabilitados. As funções de envio também verificam o carregamento, impedindo novos envios pela interface até a consulta terminar. Depois disso, é possível consultar outro CEP ou tentar novamente.

O formulário mantém rótulo, instrução associada ao campo e teclado numérico em dispositivos móveis. O carregamento usa `role="status"` e `aria-live="polite"`. As tabelas mantêm legendas, cabeçalhos com `scope` e datas em elementos `time`.

As tabelas mostram até 24 horários e sete dias, conforme os dados recebidos. Medições nulas aparecem como `Não disponível`, preservando valores zero. Datas e horas mantêm o horário local da cidade.

## Build

Dentro de `frontend/`:

```bash
npm run build
npm run preview
```

O build gera os arquivos em `dist/`. O preview local reutiliza o proxy e precisa do backend em execução para as consultas. Em produção, a hospedagem deve encaminhar `/api` ao Express na mesma origem; o proxy do Vite não faz parte dos arquivos estáticos.

Para verificar a aplicação, consulte `84010000`, teste um CEP inválido como `123` e desligue o backend para conferir a mensagem de erro de comunicação.
