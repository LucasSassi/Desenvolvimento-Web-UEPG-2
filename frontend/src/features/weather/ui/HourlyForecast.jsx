import { formatLocalTime, formatMeasurement } from '../lib/formatWeather';
import { WeatherCondition } from './CurrentWeather';

export function HourlyForecast({ hourly }) {
  const forecast = hourly.slice(0, 24).map((entry) => ({
    time: entry.time,
    displayTime: formatLocalTime(entry.time),
    temperature: formatMeasurement(entry.temperature, ' °C'),
    weatherCode: entry.weatherCode,
    precipitationProbability: formatMeasurement(entry.precipitationProbability, '%'),
    precipitation: formatMeasurement(entry.precipitation, ' mm'),
    uvIndex: formatMeasurement(entry.uvIndex),
  }));

  return (
    <section aria-labelledby="hourly-heading" className="space-y-4">
      <h2 id="hourly-heading" className="text-xl font-bold text-gray-900">Previsão das próximas 24 horas</h2>
      {forecast.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
          Previsão por horário não disponível.
        </p>
      ) : (
        <div className="max-h-[28rem] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="px-4 pt-4 pb-2 text-left text-gray-500">
              Horários locais da cidade consultada.
            </caption>
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Horário</th>
                <th scope="col" className="px-4 py-3 font-semibold">Temperatura</th>
                <th scope="col" className="px-4 py-3 font-semibold">Condição</th>
                <th scope="col" className="px-4 py-3 font-semibold">Chance de chuva</th>
                <th scope="col" className="px-4 py-3 font-semibold">Precipitação</th>
                <th scope="col" className="px-4 py-3 font-semibold">Índice UV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {forecast.map((entry) => (
                <tr key={entry.time} className="transition-colors hover:bg-sky-50">
                  <th scope="row" className="whitespace-nowrap px-4 py-3 font-medium text-gray-700">
                    <time dateTime={entry.time}>{entry.displayTime}</time>
                  </th>
                  <td className="px-4 py-3 text-base font-semibold text-gray-900">{entry.temperature}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    <WeatherCondition code={entry.weatherCode} />
                  </td>
                  <td className="px-4 py-3 font-medium text-sky-700">{entry.precipitationProbability}</td>
                  <td className="px-4 py-3 text-gray-700">{entry.precipitation}</td>
                  <td className="px-4 py-3 text-gray-700">{entry.uvIndex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
