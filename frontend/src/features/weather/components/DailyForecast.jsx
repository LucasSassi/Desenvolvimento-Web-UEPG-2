import { formatDate, formatMeasurement } from '../formatWeather';
import { WeatherCondition } from './CurrentWeather';

function getWeekday(date, index) {
  if (index === 0) return 'Hoje';
  // Meio-dia local evita que o fuso do navegador mude o dia da data ISO.
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });
}

export function DailyForecast({ daily }) {
  const days = daily.slice(0, 7);
  const temperatures = days.flatMap((entry) => [entry.temperatureMin, entry.temperatureMax]).filter((value) => value !== null);
  const weekMin = Math.min(...temperatures);
  const weekRange = Math.max(...temperatures) - weekMin || 1;

  const forecast = days.map((entry, index) => {
    const hasRange = entry.temperatureMin !== null && entry.temperatureMax !== null;
    return {
      date: entry.date,
      weekday: getWeekday(entry.date, index),
      displayDate: formatDate(entry.date),
      temperatureMax: formatMeasurement(entry.temperatureMax, ' °C'),
      temperatureMin: formatMeasurement(entry.temperatureMin, ' °C'),
      weatherCode: entry.weatherCode,
      precipitationProbabilityMax: formatMeasurement(entry.precipitationProbabilityMax, '%'),
      rangeStyle: hasRange
        ? {
            left: `${((entry.temperatureMin - weekMin) / weekRange) * 100}%`,
            width: `${((entry.temperatureMax - entry.temperatureMin) / weekRange) * 100}%`,
          }
        : null,
    };
  });

  return (
    <section aria-labelledby="daily-heading" className="space-y-4">
      <h2 id="daily-heading" className="text-xl font-bold text-gray-900">Previsão dos próximos sete dias</h2>
      {forecast.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
          Previsão diária não disponível.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="px-4 pt-4 pb-2 text-left text-gray-500">
              Inclui hoje, conforme os dados disponíveis.
            </caption>
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Data</th>
                <th scope="col" className="px-4 py-3 font-semibold">Condição</th>
                <th scope="col" className="px-4 py-3 font-semibold">Chance de chuva</th>
                <th scope="col" className="px-4 py-3 font-semibold">Mínima</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                  <span className="sr-only">Variação de temperatura</span>
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">Máxima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forecast.map((entry) => (
                <tr key={entry.date} className="transition-colors hover:bg-sky-50">
                  <th scope="row" className="whitespace-nowrap px-4 py-3 font-normal">
                    <span className="block font-semibold text-gray-900 first-letter:uppercase">{entry.weekday}</span>
                    <time dateTime={entry.date} className="text-xs text-gray-500">{entry.displayDate}</time>
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    <WeatherCondition code={entry.weatherCode} />
                  </td>
                  <td className="px-4 py-3 font-medium text-sky-700">{entry.precipitationProbabilityMax}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{entry.temperatureMin}</td>
                  <td aria-hidden="true" className="hidden w-1/4 px-4 py-3 md:table-cell">
                    <div className="relative h-2 rounded-full bg-gray-100">
                      {entry.rangeStyle && (
                        <div
                          className="absolute inset-y-0 rounded-full bg-linear-to-r from-sky-400 to-orange-400"
                          style={entry.rangeStyle}
                        />
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">{entry.temperatureMax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
