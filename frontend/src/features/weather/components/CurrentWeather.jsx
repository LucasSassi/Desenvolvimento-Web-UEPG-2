import { formatMeasurement } from '../formatWeather';

export function CurrentWeather({ location, current }) {
  const temperature = formatMeasurement(current.temperature, ' °C');
  const apparentTemperature = formatMeasurement(current.apparentTemperature, ' °C');
  const humidity = formatMeasurement(current.humidity, '%');
  const windSpeed = formatMeasurement(current.windSpeed, ' km/h');
  const uvIndex = formatMeasurement(current.uvIndex);

  return (
    <section aria-labelledby="current-weather-heading" className="space-y-3">
      <h2 id="current-weather-heading" className="text-xl font-semibold">Condições atuais</h2>
      <p>{location.city} / {location.state} — CEP {location.cep}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <dt>Temperatura atual</dt>
        <dd>{temperature}</dd>
        <dt>Sensação térmica</dt>
        <dd>{apparentTemperature}</dd>
        <dt>Umidade</dt>
        <dd>{humidity}</dd>
        <dt>Velocidade do vento</dt>
        <dd>{windSpeed}</dd>
        <dt>Índice UV</dt>
        <dd>{uvIndex}</dd>
      </dl>
    </section>
  );
}
