# ClimaCEP API

Backend de consulta meteorológica por CEP brasileiro, com Node.js, Express e TypeScript. Consulta o ViaCEP para identificar o endereço, encontra a cidade pela Open-Meteo Geocoding e obtém condições atuais e previsões pela Open-Meteo Weather. Não usa banco de dados, armazenamento de clima ou autenticação.

## Como executar

Requisitos: Node.js **22 ou superior**, npm e acesso à internet por HTTPS. O projeto foi verificado com Node.js 24. Se necessário, instale uma versão LTS compatível pelas [instruções oficiais do Node.js](https://nodejs.org/en/download).

No terminal, a partir da pasta deste projeto:

```bash
cd backend
npm install
npm run dev
```

A API inicia em `http://localhost:3000`. `npm run dev` reinicia o servidor quando arquivos TypeScript mudam. Execute os comandos npm dentro de `backend/`.

Execute `npm install` na primeira vez e quando as dependências mudarem. Nas próximas vezes, entre em `backend/` e execute apenas `npm run dev`.

Para compilar e executar o JavaScript:

```bash
npm run build
npm start
```

Para encerrar, use `Ctrl+C`.

## Configuração

As variáveis são carregadas do arquivo `.env` com dotenv e validadas com Zod na inicialização. Sem `.env`, são usados os padrões abaixo.

Para alterar algum padrão, copie `.env.example` para `.env`, edite os valores e reinicie o servidor. Esse passo é opcional para rodar localmente.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP, de 1 a 65535. |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem permitida para o futuro frontend. Configure a URL de origem, sem caminho. |
| `HTTP_TIMEOUT_MS` | `10000` | Timeout por chamada externa, incluindo leitura do JSON; de 1 a 60000 ms. |

As APIs públicas utilizadas não exigem chave para esta integração. O CORS permite GET e responde automaticamente ao preflight OPTIONS do navegador. Não existem endpoints de escrita.

## Endpoints

### `GET /api/health`

Verifica se o servidor está respondendo; não faz chamadas aos provedores externos.

```bash
curl -i http://localhost:3000/api/health
```

```json
{
  "status": "ok",
  "service": "ClimaCEP API"
}
```

### `GET /api/weather/:cep`

Aceita exatamente oito dígitos, com ou sem hífen na posição de CEP: `84010000` ou `84010-000`. Letras, espaços, outros separadores e quantidades diferentes de dígitos retornam 400. O CEP é normalizado antes da consulta ao ViaCEP.

```bash
# Ponta Grossa/PR
curl -i http://localhost:3000/api/weather/84010000

# Curitiba/PR
curl -i http://localhost:3000/api/weather/80010-000

# São Paulo/SP
curl -i http://localhost:3000/api/weather/01001000

# CEP inválido e CEP inexistente
curl -i http://localhost:3000/api/weather/123
curl -i http://localhost:3000/api/weather/99999999
```

A resposta contém os grupos `location`, `current`, `hourly` e `daily`:

| Grupo | Campos |
| --- | --- |
| `location` | `cep` (com hífen), `city`, `state` (UF), `neighborhood`, `street` |
| `current` | `temperature` (°C), `apparentTemperature` (°C), `humidity` (%), `windSpeed` (km/h), `weatherCode` (código WMO), `uvIndex` |
| `hourly[]` | `time`, `temperature` (°C), `weatherCode`, `precipitationProbability` (%), `precipitation` (mm), `uvIndex` |
| `daily[]` | `date`, `temperatureMax` (°C), `temperatureMin` (°C), `weatherCode`, `precipitationProbabilityMax` (%) |

O código retorna dados recebidos dos provedores. Dados sintéticos existem exclusivamente em `tests/`.

### Localização e cobertura

A previsão corresponde à **cidade**, não ao endereço exato do CEP. A busca de coordenadas usa o nome da cidade, filtro de país `BR`, idioma português e até 100 resultados. O service ainda verifica país, nome da cidade e UF independentemente do filtro externo.

O comparador normaliza acentuação, maiúsculas, pontuação e prefixos administrativos conhecidos. As 27 UFs estão mapeadas para seus nomes completos; também são aceitas siglas, prefixos como `Estado de` e `State of` e a tradução `Federal District`. Quando `admin2` está disponível, o município também deve corresponder. Resultados de bairros e outros tipos de localização não são usados como cidades. Capitais e sedes administrativas têm preferência sobre povoações homônimas; sedes urbanas têm preferência sobre centroides administrativos. Correspondências distintas e ambíguas na mesma categoria retornam 422, sem escolher automaticamente o primeiro resultado ou a cidade mais populosa. Nomes alternativos que não possam ser normalizados com segurança também retornam 422.

### Horários, UV e disponibilidade

- A consulta usa `timezone=auto`. `hourly[].time` é uma data e hora local no formato `YYYY-MM-DDTHH:mm`, sem conversão para o fuso do servidor. `daily[].date` usa `YYYY-MM-DD`.
- São retornados até **24 registros horários**, em ordem cronológica, com horário maior ou igual ao timestamp de `current.time` fornecido pela Open-Meteo. Exemplo: às 14:15, a série começa às 15:00; às 14:00, pode começar às 14:00.
- São retornados até **sete dias, incluindo hoje**, conforme a data local de `current.time`.
- O `current.uvIndex` vem da série horária na hora local de `current.time`, truncada para a hora cheia. Às 14:15, usa o registro das 14:00. Trata-se de uma estimativa horária; a consulta não pede `current.uv_index` nem classifica o UV.
- Campos opcionais indisponíveis e medições nulas são representados consistentemente por `null`. Zero é preservado. Se faltar o UV da hora correspondente, o valor atual é `null`.
- Se o provedor retornar menos registros, a resposta contém apenas os registros disponíveis, sem preencher horários ou inventar valores. Séries com tamanhos incompatíveis, datas inválidas ou horários repetidos/fora de ordem são rejeitadas com 502.
- `precipitation` é a precipitação total prevista pela Open-Meteo, que inclui chuva, pancadas e eventual neve; os volumes horários seguem o intervalo definido pelo provedor.

## Erros

Todas as respostas de erro da aplicação são JSON. Não incluem stack traces, corpo de erro do provedor ou detalhes internos.

```json
{
  "error": {
    "code": "INVALID_CEP",
    "message": "O CEP informado é inválido."
  }
}
```

| HTTP | Código | Situação |
| --- | --- | --- |
| 400 | `INVALID_CEP` | Formato do CEP inválido. |
| 404 | `CEP_NOT_FOUND` | ViaCEP indicou CEP inexistente. |
| 404 | `ROUTE_NOT_FOUND` | Rota ou método não implementado. |
| 422 | `CITY_NOT_IDENTIFIED` | Cidade ausente, ambígua ou sem correspondência segura de país/UF/nome. |
| 502 | `EXTERNAL_API_ERROR` | Falha de rede ou resposta HTTP externa malsucedida fora de indisponibilidade. |
| 502 | `INVALID_EXTERNAL_RESPONSE` | JSON inválido, estrutura inválida, coordenadas inválidas, CEP divergente ou séries inconsistentes. |
| 503 | `EXTERNAL_SERVICE_UNAVAILABLE` | Provedor retornou HTTP 429 ou 5xx. |
| 503 | `EXTERNAL_API_TIMEOUT` | Tempo limite da chamada externa excedido. |
| 500 | `INTERNAL_ERROR` | Erro inesperado; os detalhes ficam apenas no servidor. |

## Organização

```text
src/
├── app.ts                      # Express, CORS, rotas e middlewares
├── server.ts                   # Inicialização HTTP
├── routes/                     # Endpoints
├── controllers/                # Validação de entrada e respostas HTTP
├── services/                   # Orquestração, correspondência geográfica e transformação
├── clients/                    # ViaCEP, Geocoding, Weather e transporte HTTP compartilhado
├── types/                      # Contratos TypeScript e schemas Zod externos
├── middlewares/                # Tratamento centralizado de erros
├── errors/                     # Erro de aplicação
└── config/                     # Variáveis de ambiente
tests/                          # Testes HTTP com APIs externas simuladas
```

Fluxo: `Request → Route → Controller → Service → API Clients → APIs externas`.

`clients/http.client.ts` centraliza fetch, timeout, leitura de JSON e validação dos três provedores para evitar duplicação. Os tipos externos são inferidos dos schemas Zod, mantendo validação em tempo de execução e contratos TypeScript sincronizados. O service não depende de Request/Response.

## Verificações

```bash
npm run typecheck
npm test
npm run build
```

Os testes usam o runner nativo do Node.js, tsx, Supertest e mocks do fetch nativo. Não dependem de rede. Cobrem Ponta Grossa, Curitiba e cidades de outros estados; CEP inválido/inexistente; diferenças de nomenclatura; país/UF incorretos; cidades ambíguas; falhas HTTP/de rede; timeout inclusive na leitura do corpo; JSON externo inválido; contrato da resposta; UV no horário local; virada de dia; valores ausentes; ordenação e tamanho das séries; saúde e CORS.

Para conferir a integração real, inicie o servidor e execute os exemplos de curl. O resultado depende da disponibilidade e da cobertura dos serviços externos.

## Provedores e documentação

- [ViaCEP](https://viacep.com.br/): endereço a partir do CEP.
- [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api): coordenadas e dados de localização baseados no [GeoNames](https://www.geonames.org/).
- [Open-Meteo Weather](https://open-meteo.com/en/docs): condições e previsão meteorológica, incluindo definições dos códigos WMO e dos intervalos horários.

Ao exibir dados em um futuro frontend, mantenha a atribuição aos provedores e observe seus termos de uso.
