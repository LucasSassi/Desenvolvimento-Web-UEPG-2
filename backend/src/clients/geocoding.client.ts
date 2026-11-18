import { geocodingResponseSchema, type GeocodingResult } from '../types/location.types.js';
import { fetchJson } from './http.client.js';

export async function searchCity(city: string): Promise<GeocodingResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({ name: city, count: '100', language: 'pt', format: 'json', countryCode: 'BR' }).toString();
  const data = await fetchJson(url, geocodingResponseSchema, 'Open-Meteo Geocoding');
  return data.results ?? [];
}
