import { z } from 'zod';
import type { Location } from './location.types.js';

const localTime = z.iso.datetime({ local: true, precision: -1 });
const measurement = z.number().finite().nullable();
const probability = z.number().min(0).max(100).nullable();
const nonnegative = z.number().nonnegative().nullable();
const weatherCode = z.number().int().min(0).max(99).nullable();

const hourlySchema = z.object({
  time: z.array(localTime),
  temperature_2m: z.array(measurement),
  weather_code: z.array(weatherCode),
  precipitation_probability: z.array(probability).nullish(),
  precipitation: z.array(nonnegative).nullish(),
  uv_index: z.array(nonnegative).nullish(),
});

const dailySchema = z.object({
  time: z.array(z.iso.date()),
  temperature_2m_max: z.array(measurement),
  temperature_2m_min: z.array(measurement),
  weather_code: z.array(weatherCode),
  precipitation_probability_max: z.array(probability).nullish(),
});

export const openMeteoSchema = z.object({
  timezone: z.string().min(1),
  utc_offset_seconds: z.number().int().min(-43200).max(50400),
  current: z.object({
    time: localTime,
    temperature_2m: measurement,
    apparent_temperature: measurement.optional(),
    relative_humidity_2m: probability.optional(),
    wind_speed_10m: nonnegative.optional(),
    weather_code: weatherCode,
  }),
  hourly: hourlySchema,
  daily: dailySchema,
}).superRefine((data, ctx) => {
  for (const [groupName, group] of [['hourly', data.hourly], ['daily', data.daily]] as const) {
    for (const [key, values] of Object.entries(group)) {
      if (values && values.length !== group.time.length) {
        ctx.addIssue({ code: 'custom', path: [groupName, key], message: 'Séries com tamanhos incompatíveis.' });
      }
    }
    if (group.time.some((time, i) => i > 0 && time <= (group.time[i - 1] ?? ''))) {
      ctx.addIssue({ code: 'custom', path: [groupName, 'time'], message: 'Tempos fora de ordem ou repetidos.' });
    }
  }
});

export type OpenMeteoResponse = z.infer<typeof openMeteoSchema>;

export interface CurrentWeather {
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  uvIndex: number | null;
}

export interface HourlyWeather {
  time: string;
  temperature: number | null;
  weatherCode: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  uvIndex: number | null;
}

export interface DailyWeather {
  date: string;
  temperatureMax: number | null;
  temperatureMin: number | null;
  weatherCode: number | null;
  precipitationProbabilityMax: number | null;
}

export interface WeatherResponse {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}
