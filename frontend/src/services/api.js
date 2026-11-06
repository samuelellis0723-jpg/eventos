const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('La API devolvió una respuesta con formato inesperado.');
  }
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Error HTTP ${response.status}`);
  }
  if (payload?.success === false) {
    throw new Error(payload.message || 'La API no pudo completar la consulta.');
  }

  return payload;
}
