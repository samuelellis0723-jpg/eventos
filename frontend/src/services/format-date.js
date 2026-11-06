export function formatPublicDate(value) {
  if (!value) return 'Fecha no disponible';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}
