import { formatMeasurement } from '../lib/formatWeather';

const WEATHER_CONDITIONS = {
  0: ['☀️', 'Céu limpo'],
  1: ['🌤️', 'Predominantemente limpo'],
  2: ['⛅', 'Parcialmente nublado'],
  3: ['☁️', 'Nublado'],
  45: ['🌫️', 'Nevoeiro'],
  48: ['🌫️', 'Nevoeiro com geada'],
  51: ['🌦️', 'Garoa fraca'],
  53: ['🌦️', 'Garoa moderada'],
  55: ['🌦️', 'Garoa intensa'],
  56: ['🌧️', 'Garoa congelante fraca'],
  57: ['🌧️', 'Garoa congelante intensa'],
  61: ['🌧️', 'Chuva fraca'],
  63: ['🌧️', 'Chuva moderada'],
  65: ['🌧️', 'Chuva forte'],
  66: ['🌧️', 'Chuva congelante fraca'],
  67: ['🌧️', 'Chuva congelante forte'],
  71: ['🌨️', 'Neve fraca'],
  73: ['🌨️', 'Neve moderada'],
  75: ['❄️', 'Neve forte'],
  77: ['❄️', 'Grãos de neve'],
  80: ['🌦️', 'Pancadas de chuva fracas'],
  81: ['🌦️', 'Pancadas de chuva moderadas'],
  82: ['⛈️', 'Pancadas de chuva violentas'],
  85: ['🌨️', 'Pancadas de neve fracas'],
  86: ['🌨️', 'Pancadas de neve fortes'],
  95: ['⛈️', 'Trovoada'],
  96: ['⛈️', 'Trovoada com granizo fraco'],
  99: ['⛈️', 'Trovoada com granizo forte'],
};

const UV_LEVELS = [
  { max: 2, label: 'Baixo', className: 'bg-emerald-400/30' },
  { max: 5, label: 'Moderado', className: 'bg-yellow-300/30' },
  { max: 7, label: 'Alto', className: 'bg-orange-400/40' },
  { max: 10, label: 'Muito alto', className: 'bg-red-500/40' },
  { max: Infinity, label: 'Extremo', className: 'bg-fuchsia-500/40' },
];

const COLD_TEMP = 10;
const HOT_TEMP = 32;
const NEUTRAL_WARMTH = 0.5;
const TEMPERATURE_GRADIENT = 'linear-gradient(110deg, #1d4ed8 0%, #0284c7 30%, #f4a261 70%, #e76f51 100%)';

function getWarmth(temperature) {
  if (temperature === null) return NEUTRAL_WARMTH;
  return Math.min(Math.max((temperature - COLD_TEMP) / (HOT_TEMP - COLD_TEMP), 0), 1);
}

export function WeatherCondition({ code, className = '' }) {
  const [icon, label] = WEATHER_CONDITIONS[code] ?? ['❔', 'Não disponível'];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export function CurrentWeather({ location, current }) {
  const temperature = formatMeasurement(current.temperature, '°');
  const apparentTemperature = formatMeasurement(current.apparentTemperature, ' °C');
  const humidity = formatMeasurement(current.humidity, '%');
  const windSpeed = formatMeasurement(current.windSpeed, ' km/h');
  const uvIndex = formatMeasurement(current.uvIndex);
  const uvLevel = current.uvIndex === null ? null : UV_LEVELS.find((level) => current.uvIndex <= level.max);
  const address = [location.street, location.neighborhood].filter(Boolean).join(', ');
  const backgroundStyle = {
    backgroundImage: TEMPERATURE_GRADIENT,
    backgroundSize: '300% 100%',
    backgroundPosition: `${getWarmth(current.temperature) * 100}% 0`,
  };

  return (
    <section
      aria-labelledby="current-weather-heading"
      style={backgroundStyle}
      className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-black/15 sm:p-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 id="current-weather-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Condições atuais
          </h2>
          <p className="text-2xl font-bold sm:text-3xl">{location.city} / {location.state}</p>
          {address && <p className="text-white/80">{address}</p>}
          <p className="text-sm text-white/80">CEP {location.cep}</p>
        </div>

        <div className="space-y-2 sm:text-right">
          <p className="text-6xl font-bold leading-none tracking-tight sm:text-7xl">{temperature}</p>
          <WeatherCondition code={current.weatherCode} className="text-lg font-medium" />
        </div>
      </div>

      <dl className="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
          <dt className="text-sm text-white/80">Sensação térmica</dt>
          <dd className="mt-1 text-xl font-semibold">{apparentTemperature}</dd>
        </div>
        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
          <dt className="text-sm text-white/80">Umidade</dt>
          <dd className="mt-1 text-xl font-semibold">{humidity}</dd>
        </div>
        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
          <dt className="text-sm text-white/80">Velocidade do vento</dt>
          <dd className="mt-1 text-xl font-semibold">{windSpeed}</dd>
        </div>
        <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
          <dt className="text-sm text-white/80">Índice UV</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2 text-xl font-semibold">
            {uvIndex}
            {uvLevel && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${uvLevel.className}`}>
                {uvLevel.label}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
