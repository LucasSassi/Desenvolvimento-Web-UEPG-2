export function formatMeasurement(value, unit = '') {
  if (value === null || value === undefined) return 'Não disponível';
  return `${value}${unit}`;
}

export function formatDate(date) {
  return date.split('-').reverse().join('/');
}

export function formatLocalTime(time) {
  const date = formatDate(time.slice(0, 10));
  const hours = time.slice(11, 16);
  return `${date} ${hours}`;
}
