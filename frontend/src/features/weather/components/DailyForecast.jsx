import { formatDate, formatMeasurement } from '../formatWeather';

export function DailyForecast({ daily }) {
  const forecast = daily.slice(0, 7).map((entry) => ({
    date: entry.date,
    displayDate: formatDate(entry.date),
    temperatureMax: formatMeasurement(entry.temperatureMax, ' °C'),
    temperatureMin: formatMeasurement(entry.temperatureMin, ' °C'),
    weatherCode: formatMeasurement(entry.weatherCode),
    precipitationProbabilityMax: formatMeasurement(entry.precipitationProbabilityMax, '%'),
  }));

  return (
    <section aria-labelledby="daily-heading" className="space-y-3">
      <h2 id="daily-heading" className="text-xl font-semibold">Previsão dos próximos sete dias</h2>
      {forecast.length === 0 ? <p>Previsão diária não disponível.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="pb-2 text-left text-gray-600">Inclui hoje, conforme os dados disponíveis. Condição em código WMO.</caption>
            <thead>
              <tr className="border-b border-gray-300">
                <th scope="col" className="p-2">Data</th>
                <th scope="col" className="p-2">Máxima</th>
                <th scope="col" className="p-2">Mínima</th>
                <th scope="col" className="p-2">Condição (WMO)</th>
                <th scope="col" className="p-2">Probabilidade máxima de chuva</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((entry) => (
                <tr key={entry.date} className="border-b border-gray-200">
                  <th scope="row" className="whitespace-nowrap p-2 font-normal">
                    <time dateTime={entry.date}>{entry.displayDate}</time>
                  </th>
                  <td className="p-2">{entry.temperatureMax}</td>
                  <td className="p-2">{entry.temperatureMin}</td>
                  <td className="p-2">{entry.weatherCode}</td>
                  <td className="p-2">{entry.precipitationProbabilityMax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
