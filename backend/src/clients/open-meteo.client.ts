import { openMeteoSchema, type OpenMeteoResponse } from '../types/weather.types.js';
import { fetchJson } from './http.client.js';

export async function getForecast(latitude: number, longitude: number): Promise<OpenMeteoResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    hourly: 'temperature_2m,weather_code,precipitation_probability,precipitation,uv_index',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
  }).toString();
  return fetchJson(url, openMeteoSchema, 'Open-Meteo Weather');
}
