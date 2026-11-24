import { getAddress, searchAddresses } from '../clients/viacep.client.js';
import { searchCity } from '../clients/geocoding.client.js';
import { getForecast } from '../clients/open-meteo.client.js';
import { AppError } from '../errors/app.error.js';
import {
  brazilianStates,
  type BrazilianState,
  type GeocodingResult,
  type Location,
  type ViaCepLocation,
} from '../types/location.types.js';
import type { WeatherResponse } from '../types/weather.types.js';

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeState(value: string): string {
  const state = normalizeName(value).replace(/^(estado (de|do|da) |state of )/, '');
  return state === 'federal district' ? 'distrito federal' : state;
}

function normalizeCity(value: string): string {
  return normalizeName(value).replace(/^municipio (de|do|da) /, '');
}

function identifyCity(address: ViaCepLocation, candidates: GeocodingResult[]): GeocodingResult {
  const city = normalizeCity(address.localidade);
  const state = normalizeName(brazilianStates[address.uf]);
  const matches = candidates.filter((candidate) => {
    const candidateState = normalizeState(candidate.admin1 ?? '');
    return candidate.country_code.toUpperCase() === 'BR'
      && normalizeCity(candidate.name) === city
      && (candidateState === state || candidateState === address.uf.toLowerCase())
      && (!candidate.admin2 || normalizeCity(candidate.admin2) === city)
      && /^(PPL|PPLA[1-5]?|PPLC|ADM2)$/.test(candidate.feature_code ?? '');
  });

  const seats = matches.filter((match) => /^PPL(A[1-5]?|C)$/.test(match.feature_code ?? ''));
  const populated = matches.filter((match) => match.feature_code !== 'ADM2');
  const preferred = seats.length ? seats : populated.length ? populated : matches;
  const unique = new Map(preferred.map((match) => [`${match.latitude},${match.longitude}`, match]));
  const [match] = unique.values();
  if (unique.size !== 1 || !match) {
    throw new AppError(422, 'CITY_NOT_IDENTIFIED', 'A cidade não pôde ser identificada com segurança.');
  }
  return match;
}

function mapViaCepToLocation(address: ViaCepLocation): Location {
  const digits = address.cep.replace(/\D/g, '');
  return {
    cep: `${digits.slice(0, 5)}-${digits.slice(5)}`,
    city: address.localidade,
    state: address.uf,
    neighborhood: address.bairro?.trim() || null,
    street: address.logradouro?.trim() || null,
  };
}

export async function searchLocationsByAddress(
  uf: BrazilianState,
  city: string,
  street: string,
): Promise<Location[]> {
  const addresses = await searchAddresses(uf, city, street);
  return addresses.map(mapViaCepToLocation);
}

export async function getWeatherByCep(cep: string): Promise<WeatherResponse> {
  const address = await getAddress(cep);
  const coordinates = identifyCity(address, await searchCity(address.localidade));
  const forecast = await getForecast(coordinates.latitude, coordinates.longitude);
  const { current, hourly, daily } = forecast;

  const currentHour = `${current.time.slice(0, 13)}:00`;
  const uvHourIndex = hourly.time.indexOf(currentHour);
  const currentDate = current.time.slice(0, 10);

  return {
    location: mapViaCepToLocation(address),
    current: {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      weatherCode: current.weather_code,
      uvIndex: hourly.uv_index?.[uvHourIndex] ?? null,
    },
    hourly: hourly.time.map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[i] ?? null,
      weatherCode: hourly.weather_code[i] ?? null,
      precipitationProbability: hourly.precipitation_probability?.[i] ?? null,
      precipitation: hourly.precipitation?.[i] ?? null,
      uvIndex: hourly.uv_index?.[i] ?? null,
    })).filter((entry) => entry.time >= current.time).slice(0, 24),
    daily: daily.time.map((date, i) => ({
      date,
      temperatureMax: daily.temperature_2m_max[i] ?? null,
      temperatureMin: daily.temperature_2m_min[i] ?? null,
      weatherCode: daily.weather_code[i] ?? null,
      precipitationProbabilityMax: daily.precipitation_probability_max?.[i] ?? null,
    })).filter((entry) => entry.date >= currentDate).slice(0, 7),
  };
}