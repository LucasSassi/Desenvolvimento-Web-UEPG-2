import { useState } from 'react';
import { getWeatherByCep } from './features/weather/api/weather.api';
import { CepSearch } from './features/weather/components/CepSearch';
import { CurrentWeather } from './features/weather/components/CurrentWeather';
import { HourlyForecast } from './features/weather/components/HourlyForecast';
import { DailyForecast } from './features/weather/components/DailyForecast';

export function App() {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function searchWeather(value) {
    if (isLoading) return;

    const input = value.trim();
    setWeather(null);
    setError(null);

    if (!/^\d{5}-?\d{3}$/.test(input)) {
      setError('CEP inválido. Informe oito dígitos, com ou sem hífen.');
      return;
    }

    const cep = input.replace('-', '');
    setIsLoading(true);

    try {
      const weatherData = await getWeatherByCep(cep);
      setWeather(weatherData);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
      <header className="space-y-3 pt-6">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-sky-700 sm:text-5xl">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-2xl bg-sky-600 text-2xl text-white shadow-lg shadow-sky-600/30"
          >
            ☀
          </span>
          ClimaCEP
        </h1>
        <p className="max-w-xl text-lg text-slate-600">
          Consulte as condições atuais e a previsão do tempo pelo CEP.
        </p>
      </header>
      <CepSearch onSearch={searchWeather} isLoading={isLoading} />
      <div role="status" aria-live="polite">
        {isLoading && <p>Consultando previsão do tempo...</p>}
      </div>
      {error && <p role="alert">{error}</p>}
      {weather && (
        <div className="space-y-8" aria-busy={isLoading}>
          <CurrentWeather location={weather.location} current={weather.current} />
          <HourlyForecast hourly={weather.hourly} />
          <DailyForecast daily={weather.daily} />
        </div>
      )}
      <footer className="border-t border-gray-200 pt-4 text-sm text-gray-600">
        Dados de endereço: <a href="https://viacep.com.br/" className="underline">ViaCEP</a>.
        {' '}Previsão e geolocalização: <a href="https://open-meteo.com/" className="underline">Open-Meteo</a>
        {' '}e <a href="https://www.geonames.org/" className="underline">GeoNames</a>.
        {' '}A previsão corresponde à cidade do CEP.
      </footer>
    </main>
  );
}
