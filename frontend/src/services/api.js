const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: options.credentials || (path.startsWith('/admin') ? 'include' : 'same-origin'),
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
    const error = new Error(payload?.message || `Error HTTP ${response.status}`);
    error.status = response.status;
    error.code = payload?.code;
    if (path.startsWith('/admin') && typeof window !== 'undefined' && (response.status === 401 || error.code === 'FORBIDDEN')) {
      window.dispatchEvent(new Event('admin-session-changed'));
    }
    throw error;
  }
  if (payload?.success === false) {
    throw new Error(payload.message || 'La API no pudo completar la consulta.');
  }

  return payload;
}

export async function getAdminCsrfToken(options = {}) {
  const response = await apiFetch('/auth/csrf', { ...options, credentials: 'include' });
  return response.data.csrfToken;
}

export async function loginAdmin({ correo, contrasena }, csrfToken) {
  return apiFetch('/auth/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ correo, contrasena }),
    headers: { 'X-CSRF-Token': csrfToken },
  });
}

export async function getAdminSession(options = {}) {
  return apiFetch('/auth/session', { ...options, credentials: 'include' });
}

export async function logoutAdmin(csrfToken) {
  return adminApiFetch('/auth/logout', { method: 'POST' }, csrfToken);
}

export async function adminApiFetch(path, options = {}, csrfToken) {
  const method = options.method || 'GET';
  const mutating = !['GET', 'HEAD'].includes(method);
  let token = mutating ? (csrfToken || await getAdminCsrfToken()) : null;
  const execute = () => apiFetch(path, { ...options, credentials: 'include', headers: { ...options.headers, ...(token ? { 'X-CSRF-Token': token } : {}) } });
  try { return await execute(); }
  catch (error) {
    if (!mutating || error.code !== 'CSRF_INVALID') throw error;
    token = await getAdminCsrfToken();
    return execute();
  }
}
