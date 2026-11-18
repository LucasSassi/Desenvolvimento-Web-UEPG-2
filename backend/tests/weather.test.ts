import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import request from 'supertest';
import express from 'express';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';
import type { WeatherResponse } from '../src/types/weather.types.js';
import { makeAddress, makeCandidate, makeForecast } from './fixtures.js';

interface MockOptions {
  address?: unknown;
  geocoding?: unknown;
  weather?: unknown;
  intercept?: (url: URL, init?: RequestInit) => Response | Promise<Response> | undefined;
}

function mockApis(options: MockOptions = {}) {
  const calls: URL[] = [];
  mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input);
    calls.push(url);
    const intercepted = options.intercept?.(url, init);
    if (intercepted) return intercepted;
    if (url.hostname === 'viacep.com.br') return Response.json(options.address ?? makeAddress());
    if (url.hostname === 'geocoding-api.open-meteo.com') {
      return Response.json(options.geocoding ?? { results: [makeCandidate()] });
    }
    if (url.hostname === 'api.open-meteo.com') return Response.json(options.weather ?? makeForecast());
    throw new Error(`Requisição inesperada no teste: ${url.hostname}`);
  });
  return calls;
}

afterEach(() => mock.restoreAll());

test('GET /api/health retorna identificação do serviço sem chamar APIs', async () => {
  const calls = mockApis();
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok', service: 'ClimaCEP API' });
  assert.equal(calls.length, 0);
});

test('Ponta Grossa: integra as três APIs e retorna o contrato completo', async () => {
  const calls = mockApis();
  const response = await request(app).get('/api/weather/84010000').expect(200);
  const body = response.body as WeatherResponse;
  assert.deepEqual(Object.keys(body).sort(), ['current', 'daily', 'hourly', 'location']);
  assert.deepEqual(body.location, { cep: '84010-000', city: 'Ponta Grossa', state: 'PR', neighborhood: 'Centro', street: null });
  assert.deepEqual(body.current, { temperature: 24, apparentTemperature: 26, humidity: 72, windSpeed: 12, weatherCode: 2, uvIndex: 14 });
  assert.equal(body.hourly.length, 24);
  assert.deepEqual(body.hourly[0], { time: '2026-11-18T15:00', temperature: 24, weatherCode: 2, precipitationProbability: 40, precipitation: 1.2, uvIndex: 15 });
  assert.equal(body.hourly.at(-1)?.time, '2026-11-19T14:00');
  assert.equal(body.daily.length, 7);
  assert.deepEqual(body.daily[0], { date: '2026-11-18', temperatureMax: 27, temperatureMin: 18, weatherCode: 61, precipitationProbabilityMax: 60 });
  assert.equal(body.daily.at(-1)?.date, '2026-11-24');
  assert.ok(body.hourly.every((entry, i) => i === 0 || entry.time > (body.hourly[i - 1]?.time ?? '')));
  assert.equal(calls.length, 3);
  assert.equal(calls[0]?.pathname, '/ws/84010000/json/');
  assert.equal(calls[1]?.searchParams.get('countryCode'), 'BR');
  assert.equal(calls[1]?.searchParams.get('name'), 'Ponta Grossa');
  const weatherUrl = calls[2];
  assert.equal(weatherUrl?.searchParams.get('latitude'), '-25.095');
  assert.equal(weatherUrl?.searchParams.get('longitude'), '-50.1619');
  assert.equal(weatherUrl?.searchParams.get('timezone'), 'auto');
  assert.equal(weatherUrl?.searchParams.get('forecast_days'), '7');
  assert.equal(weatherUrl?.searchParams.get('wind_speed_unit'), 'kmh');
  assert.equal(weatherUrl?.searchParams.get('temperature_unit'), 'celsius');
  assert.equal(weatherUrl?.searchParams.get('precipitation_unit'), 'mm');
  assert.ok(weatherUrl?.searchParams.get('hourly')?.includes('uv_index'));
  assert.ok(!weatherUrl?.searchParams.get('current')?.includes('uv_index'));
});

for (const [cep, city, state, apiCity, apiState, latitude, longitude] of [
  ['80010-000', 'Curitiba', 'PR', 'Curitiba', 'Parana', -25.4278, -49.2731],
  ['01001-000', 'São Paulo', 'SP', 'Sao Paulo', 'São Paulo', -23.5475, -46.6361],
  ['20040-020', 'Rio de Janeiro', 'RJ', 'Rio de Janeiro', 'State of Rio de Janeiro', -22.9068, -43.1729],
  ['30130-010', 'Belo Horizonte', 'MG', 'Belo Horizonte', 'Estado de Minas Gerais', -19.9208, -43.9378],
  ['70040-010', 'Brasília', 'DF', 'Brasilia', 'Distrito Federal', -15.7797, -47.9297],
  ['70040-010', 'Brasília', 'DF', 'Brasilia', 'Federal District', -15.7797, -47.9297],
  ['69005-070', 'Manaus', 'AM', 'Manaus', 'AM', -3.1019, -60.025],
] as const) {
  test(`consulta ${city}/${state} e aceita CEP com hífen e variação de nomenclatura`, async () => {
    const candidate = { ...makeCandidate(apiCity, apiState), latitude, longitude };
    const calls = mockApis({ address: makeAddress(cep, city, state), geocoding: { results: [candidate] } });
    const response = await request(app).get(`/api/weather/${cep}`).expect(200);
    const body = response.body as WeatherResponse;
    assert.equal(body.location.city, city);
    assert.equal(body.location.state, state);
    assert.equal(calls[2]?.searchParams.get('latitude'), String(latitude));
    assert.equal(calls[2]?.searchParams.get('longitude'), String(longitude));
  });
}

for (const cep of ['123', '123456789', '8401A000', '8401-0000', '84010--000', '84010%20000', '%2084010000']) {
  test(`CEP inválido (${cep}) retorna 400 sem consultar APIs`, async () => {
    const calls = mockApis();
    const response = await request(app).get(`/api/weather/${cep}`).expect(400);
    assert.deepEqual(response.body, { error: { code: 'INVALID_CEP', message: 'O CEP informado é inválido.' } });
    assert.equal(calls.length, 0);
  });
}

for (const erro of [true, 'true']) {
  test(`CEP inexistente com erro=${String(erro)} retorna 404`, async () => {
    const calls = mockApis({ address: { erro } });
    const response = await request(app).get('/api/weather/99999999').expect(404);
    assert.equal(response.body.error.code, 'CEP_NOT_FOUND');
    assert.equal(calls.length, 1);
  });
}

for (const geocoding of [
  {},
  { results: [] },
  { results: [{ ...makeCandidate(), country_code: 'PT' }] },
  { results: [makeCandidate('Ponta Grossa', 'São Paulo')] },
  { results: [makeCandidate('Ponta Grossa do Sul')] },
  { results: [{ ...makeCandidate(), admin1: undefined }] },
  { results: [{ ...makeCandidate(), feature_code: 'PPLX' }] },
  { results: [{ ...makeCandidate(), admin2: 'Outro Município' }] },
  { results: [makeCandidate(), { ...makeCandidate(), id: 2, latitude: -26 }] },
  { results: [{ ...makeCandidate(), feature_code: 'PPLA' }, { ...makeCandidate(), id: 2, latitude: -26, feature_code: 'PPLA2' }] },
]) {
  test(`geocodificação sem correspondência segura retorna 422: ${JSON.stringify(geocoding)}`, async () => {
    const calls = mockApis({ geocoding });
    const response = await request(app).get('/api/weather/84010000').expect(422);
    assert.equal(response.body.error.code, 'CITY_NOT_IDENTIFIED');
    assert.equal(calls.length, 2);
  });
}

test('ignora primeiro resultado em outra UF e seleciona correspondência segura', async () => {
  const calls = mockApis({ geocoding: { results: [
    makeCandidate('Ponta Grossa', 'São Paulo'),
    { ...makeCandidate(), latitude: -25.1, longitude: -50.2 },
  ] } });
  await request(app).get('/api/weather/84010000').expect(200);
  assert.equal(calls[2]?.searchParams.get('latitude'), '-25.1');
});

test('prefere sede urbana ao centroide administrativo e aceita duplicata de coordenadas', async () => {
  const calls = mockApis({ geocoding: { results: [
    { ...makeCandidate(), feature_code: 'ADM2', latitude: -25.2 },
    makeCandidate(),
    { ...makeCandidate(), id: 2 },
  ] } });
  await request(app).get('/api/weather/84010000').expect(200);
  assert.equal(calls[2]?.searchParams.get('latitude'), '-25.095');
});

test('aceita município identificado pelo nome administrativo', async () => {
  mockApis({ geocoding: { results: [{ ...makeCandidate('Município de Ponta Grossa'), feature_code: 'ADM2' }] } });
  await request(app).get('/api/weather/84010000').expect(200);
});

test('São Paulo: distingue a capital de povoação homônima no mesmo estado e município', async () => {
  const calls = mockApis({
    address: makeAddress('01001-000', 'São Paulo', 'SP'),
    geocoding: { results: [
      { ...makeCandidate('São Paulo', 'São Paulo'), id: 7630231, admin2: 'São Paulo', latitude: -23.7531, longitude: -46.6695 },
      { ...makeCandidate('São Paulo', 'São Paulo'), id: 3448439, feature_code: 'PPLA', latitude: -23.5475, longitude: -46.63611 },
    ] },
  });
  await request(app).get('/api/weather/01001000').expect(200);
  assert.equal(calls[2]?.searchParams.get('latitude'), '-23.5475');
  assert.equal(calls[2]?.searchParams.get('longitude'), '-46.63611');
});

for (const host of ['viacep.com.br', 'geocoding-api.open-meteo.com', 'api.open-meteo.com']) {
  for (const status of [400, 429, 500, 503]) {
    test(`${host} com HTTP ${status} retorna erro padronizado`, async () => {
      mockApis({ intercept: (url) => url.hostname === host ? new Response('upstream private detail', { status }) : undefined });
      const response = await request(app).get('/api/weather/84010000').expect(status === 400 ? 502 : 503);
      assert.ok(response.body.error.code);
      assert.ok(!JSON.stringify(response.body).includes('private detail'));
      assert.ok(!('stack' in response.body.error));
    });
  }
}

test('falha de rede retorna 502 sem expor a causa interna', async () => {
  mockApis({ intercept: () => { throw new TypeError('private DNS failure'); } });
  const response = await request(app).get('/api/weather/84010000').expect(502);
  assert.equal(response.body.error.code, 'EXTERNAL_API_ERROR');
  assert.ok(!JSON.stringify(response.body).includes('DNS'));
});

test('timeout aborta a requisição externa e retorna 503', async () => {
  const originalTimeout = env.HTTP_TIMEOUT_MS;
  env.HTTP_TIMEOUT_MS = 20;
  let aborted = false;
  mockApis({ intercept: (_url, init) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => {
      aborted = true;
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  }) });
  try {
    const response = await request(app).get('/api/weather/84010000').expect(503);
    assert.equal(response.body.error.code, 'EXTERNAL_API_TIMEOUT');
    assert.equal(aborted, true);
  } finally {
    env.HTTP_TIMEOUT_MS = originalTimeout;
  }
});

test('timeout também cobre a leitura do corpo da resposta', async () => {
  const originalTimeout = env.HTTP_TIMEOUT_MS;
  env.HTTP_TIMEOUT_MS = 20;
  mockApis({ intercept: (_url, init) => new Response(new ReadableStream({
    start(controller) {
      init?.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')), { once: true });
    },
  })) });
  try {
    const response = await request(app).get('/api/weather/84010000').expect(503);
    assert.equal(response.body.error.code, 'EXTERNAL_API_TIMEOUT');
  } finally {
    env.HTTP_TIMEOUT_MS = originalTimeout;
  }
});

test('JSON inválido retorna 502', async () => {
  mockApis({ intercept: () => new Response('<html>invalid</html>') });
  const response = await request(app).get('/api/weather/84010000').expect(502);
  assert.equal(response.body.error.code, 'INVALID_EXTERNAL_RESPONSE');
});

for (const address of [{}, { ...makeAddress(), uf: 'XX' }, { ...makeAddress(), cep: '01001-000' }, { ...makeAddress(), erro: 'unexpected' }]) {
  test(`ViaCEP inválido retorna 502: ${JSON.stringify(address)}`, async () => {
    mockApis({ address });
    const response = await request(app).get('/api/weather/84010000').expect(502);
    assert.equal(response.body.error.code, 'INVALID_EXTERNAL_RESPONSE');
  });
}

test('resposta de erro da geocodificação com HTTP 200 retorna 502', async () => {
  mockApis({ geocoding: { error: true, reason: 'private detail' } });
  const response = await request(app).get('/api/weather/84010000').expect(502);
  assert.equal(response.body.error.code, 'INVALID_EXTERNAL_RESPONSE');
});

test('coordenadas inválidas da geocodificação retornam 502', async () => {
  mockApis({ geocoding: { results: [{ ...makeCandidate(), latitude: 120 }] } });
  await request(app).get('/api/weather/84010000').expect(502);
});

test('campos opcionais ausentes e valores nulos permanecem null, sem inventar dados', async () => {
  const source = makeForecast();
  const weather = {
    ...source,
    current: { time: source.current.time, temperature_2m: null, weather_code: null },
    hourly: { time: source.hourly.time, temperature_2m: source.hourly.time.map(() => null), weather_code: source.hourly.weather_code },
    daily: { ...source.daily, precipitation_probability_max: undefined },
  };
  mockApis({ weather, address: { ...makeAddress(), bairro: undefined, logradouro: null } });
  const response = await request(app).get('/api/weather/84010000').expect(200);
  const body = response.body as WeatherResponse;
  assert.deepEqual(body.current, { temperature: null, apparentTemperature: null, humidity: null, windSpeed: null, weatherCode: null, uvIndex: null });
  assert.equal(body.location.neighborhood, null);
  assert.equal(body.location.street, null);
  assert.equal(body.hourly[0]?.temperature, null);
  assert.equal(body.hourly[0]?.uvIndex, null);
  assert.equal(body.hourly[0]?.precipitationProbability, null);
  assert.equal(body.hourly[0]?.precipitation, null);
  assert.equal(body.daily[0]?.precipitationProbabilityMax, null);
});

test('UV atual usa a hora local, preserva zero e a previsão atravessa meia-noite', async () => {
  mockApis({ weather: { ...makeForecast('2026-11-18T23:45'), timezone: 'America/Manaus', utc_offset_seconds: -14400 } });
  const response = await request(app).get('/api/weather/84010000').expect(200);
  const body = response.body as WeatherResponse;
  assert.equal(body.current.uvIndex, 23);
  assert.equal(body.hourly.length, 24);
  assert.equal(body.hourly[0]?.time, '2026-11-19T00:00');
  assert.equal(body.hourly[0]?.uvIndex, 0);
  assert.equal(body.hourly.at(-1)?.time, '2026-11-19T23:00');
});

test('inclui a hora atual quando ela coincide exatamente com o registro horário', async () => {
  mockApis({ weather: makeForecast('2026-11-18T14:00') });
  const response = await request(app).get('/api/weather/84010000').expect(200);
  assert.equal((response.body as WeatherResponse).hourly[0]?.time, '2026-11-18T14:00');
});

test('retorna apenas registros disponíveis quando a série externa é menor', async () => {
  const weather = makeForecast('2026-11-24T22:15');
  mockApis({ weather });
  const response = await request(app).get('/api/weather/84010000').expect(200);
  const body = response.body as WeatherResponse;
  assert.equal(body.hourly.length, 1);
  assert.equal(body.daily.length, 1);
});

test('sem UV da hora atual, retorna null em vez de buscar outra hora', async () => {
  const source = makeForecast('2026-11-17T23:45');
  mockApis({ weather: source });
  const response = await request(app).get('/api/weather/84010000').expect(200);
  assert.equal((response.body as WeatherResponse).current.uvIndex, null);
});

for (const mutation of ['missing-current', 'length', 'order', 'duplicate', 'invalid-date', 'invalid-probability'] as const) {
  test(`resposta meteorológica inválida (${mutation}) retorna 502`, async () => {
    const weather = makeForecast();
    let payload: unknown = weather;
    if (mutation === 'missing-current') payload = { ...weather, current: undefined };
    if (mutation === 'length') weather.hourly.temperature_2m.pop();
    if (mutation === 'order') weather.hourly.time.reverse();
    if (mutation === 'duplicate') weather.hourly.time[1] = weather.hourly.time[0] ?? '';
    if (mutation === 'invalid-date') weather.daily.time[0] = '2026-02-30';
    if (mutation === 'invalid-probability') weather.hourly.precipitation_probability[0] = 101;
    mockApis({ weather: payload });
    const response = await request(app).get('/api/weather/84010000').expect(502);
    assert.equal(response.body.error.code, 'INVALID_EXTERNAL_RESPONSE');
  });
}

test('configura CORS para o frontend', async () => {
  const response = await request(app).get('/api/health').set('Origin', env.CORS_ORIGIN).expect(200);
  assert.equal(response.headers['access-control-allow-origin'], env.CORS_ORIGIN);
  const preflight = await request(app).options('/api/weather/84010000').set('Origin', env.CORS_ORIGIN).set('Access-Control-Request-Method', 'GET').expect(204);
  assert.equal(preflight.headers['access-control-allow-methods'], 'GET');
});

test('rotas inexistentes e métodos não implementados retornam JSON sem chamar APIs', async () => {
  const calls = mockApis();
  const response = await request(app).get('/api/unknown').expect(404);
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
  await request(app).post('/api/weather/84010000').expect(404);
  assert.equal(calls.length, 0);
});

test('erro inesperado retorna 500 sem expor informações internas', async () => {
  const isolatedApp = express();
  const logger = mock.method(console, 'error', () => {});
  isolatedApp.get('/unexpected', () => { throw new Error('private internal detail'); });
  isolatedApp.use(errorMiddleware);
  const response = await request(isolatedApp).get('/unexpected').expect(500);
  assert.deepEqual(response.body, { error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno inesperado.' } });
  assert.equal(logger.mock.callCount(), 1);
});
