import { useState } from 'react';
import { useNavigate } from 'react-router';
import { logoutAdmin } from '../../services/api.js';

export default function AdminLogoutButton({ csrfToken }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    setPending(true);
    setError('');
    try {
      await logoutAdmin(csrfToken);
      navigate('/admin/login', { replace: true, state: { signedOut: true } });
    } catch (requestError) {
      if (requestError.status === 401) {
        navigate('/admin/login', { replace: true, state: { expired: true } });
        return;
      }
      setError(requestError.message || 'No se pudo cerrar la sesión.');
      setPending(false);
    }
  }

  return (
    <div className="admin-logout">
      <button className="admin-button admin-button--secondary" type="button" onClick={handleLogout} disabled={pending}>
        {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
      {error && <span className="admin-logout__error" role="alert">{error}</span>}
    </div>
  );
}
