export function makeAddress(cep = '84010-000', city = 'Ponta Grossa', state = 'PR') {
  return { cep, localidade: city, uf: state, bairro: 'Centro', logradouro: '' };
}

export function makeCandidate(name = 'Ponta Grossa', admin1 = 'Paraná') {
  return {
    id: 3453186,
    name,
    admin1,
    country_code: 'BR',
    feature_code: 'PPL',
    latitude: -25.095,
    longitude: -50.1619,
  };
}

export function makeForecast(currentTime = '2026-11-18T14:15') {
  const start = Date.parse('2026-11-18T00:00:00Z');
  const time = Array.from({ length: 7 * 24 }, (_, i) => new Date(start + i * 3600000).toISOString().slice(0, 16));
  const days = Array.from({ length: 7 }, (_, i) => new Date(start + i * 86400000).toISOString().slice(0, 10));
  return {
    timezone: 'America/Sao_Paulo',
    utc_offset_seconds: -10800,
    current: {
      time: currentTime,
      temperature_2m: 24,
      apparent_temperature: 26,
      relative_humidity_2m: 72,
      wind_speed_10m: 12,
      weather_code: 2,
    },
    hourly: {
      time,
      temperature_2m: time.map(() => 24),
      weather_code: time.map(() => 2),
      precipitation_probability: time.map(() => 40),
      precipitation: time.map(() => 1.2),
      uv_index: time.map((_, i) => i % 24),
    },
    daily: {
      time: days,
      temperature_2m_max: days.map(() => 27),
      temperature_2m_min: days.map(() => 18),
      weather_code: days.map(() => 61),
      precipitation_probability_max: days.map(() => 60),
    },
  };
}
