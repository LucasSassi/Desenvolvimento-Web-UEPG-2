import { formatLocalTime, formatMeasurement } from '../formatWeather';

export function HourlyForecast({ hourly }) {
  const forecast = hourly.slice(0, 24).map((entry) => ({
    time: entry.time,
    displayTime: formatLocalTime(entry.time),
    temperature: formatMeasurement(entry.temperature, ' °C'),
    weatherCode: formatMeasurement(entry.weatherCode),
    precipitationProbability: formatMeasurement(entry.precipitationProbability, '%'),
    precipitation: formatMeasurement(entry.precipitation),
    uvIndex: formatMeasurement(entry.uvIndex),
  }));

  return (
    <section aria-labelledby="hourly-heading" className="space-y-3">
      <h2 id="hourly-heading" className="text-xl font-semibold">Previsão das próximas 24 horas</h2>
      {forecast.length === 0 ? <p>Previsão por horário não disponível.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="pb-2 text-left text-gray-600">Horários locais da cidade consultada. Condição em código WMO.</caption>
            <thead>
              <tr className="border-b border-gray-300">
                <th scope="col" className="p-2">Horário</th>
                <th scope="col" className="p-2">Temperatura</th>
                <th scope="col" className="p-2">Condição (WMO)</th>
                <th scope="col" className="p-2">Probabilidade de chuva</th>
                <th scope="col" className="p-2">Precipitação (mm)</th>
                <th scope="col" className="p-2">Índice UV</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((entry) => (
                <tr key={entry.time} className="border-b border-gray-200">
                  <th scope="row" className="whitespace-nowrap p-2 font-normal">
                    <time dateTime={entry.time}>{entry.displayTime}</time>
                  </th>
                  <td className="p-2">{entry.temperature}</td>
                  <td className="p-2">{entry.weatherCode}</td>
                  <td className="p-2">{entry.precipitationProbability}</td>
                  <td className="p-2">{entry.precipitation}</td>
                  <td className="p-2">{entry.uvIndex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
