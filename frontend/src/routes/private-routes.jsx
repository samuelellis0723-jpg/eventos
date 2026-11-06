import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import AdminAccessDeniedPage from '../pages/admin-access-denied-page.jsx';
import { getAdminSession } from '../services/api.js';

function SessionCheck({ message }) {
  return (
    <main className="admin-session-check" role="status" aria-live="polite">
      <p>{message}</p>
    </main>
  );
}

function SessionError({ error, onRetry }) {
  return (
    <main className="admin-session-check">
      <div className="admin-state admin-state--error" role="alert">
        <h1>No se pudo comprobar la sesión</h1>
        <p>{error}</p>
        <button className="admin-button admin-button--secondary" type="button" onClick={onRetry}>
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}

export default function PrivateRoutes() {
  const location = useLocation();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ status: 'checking', session: null, error: '' });

  const checkSession = useCallback(async (signal) => {
    setResult({ status: 'checking', session: null, error: '' });
    try {
      const response = await getAdminSession({ signal });
      setResult({ status: 'ready', session: response.data, error: '' });
    } catch (error) {
      if (signal.aborted) return;
      if (error.status === 401) {
        setResult({ status: 'expired', session: null, error: '' });
      } else if (error.status === 403) {
        setResult({ status: 'denied', session: null, error: error.message });
      } else {
        setResult({ status: 'error', session: null, error: error.message });
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    checkSession(controller.signal);
    return () => controller.abort();
  }, [attempt, checkSession]);

  if (result.status === 'checking') return <SessionCheck message="Comprobando la sesión…" />;

  if (result.status === 'expired') {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ expired: true, returnTo: returnTo === '/admin/login' ? '/admin' : returnTo }}
      />
    );
  }

  if (result.status === 'denied') {
    return <AdminAccessDeniedPage />;
  }

  if (result.status === 'error') {
    return <SessionError error={result.error} onRetry={() => setAttempt((value) => value + 1)} />;
  }

  const roles = result.session?.usuario?.roles || [];
  const hasAdminRole = roles.some((role) => role.codigo === 'admin');
  if (!hasAdminRole) return <AdminAccessDeniedPage session={result.session} />;

  return <Outlet context={result.session} />;
}
