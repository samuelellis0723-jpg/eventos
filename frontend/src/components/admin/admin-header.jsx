import { Link } from 'react-router';
import AdminLogoutButton from './admin-logout-button.jsx';

export default function AdminHeader({ csrfToken, authenticated = false }) {
  return (
    <header className="admin-header">
      <Link className="admin-brand" to="/" aria-label="Eventos+, volver al sitio público">
        <span className="admin-brand__mark" aria-hidden="true">E</span>
        <span>Eventos<span className="admin-brand__accent">+</span></span>
      </Link>
      <div className="admin-header__actions">
        <Link className="admin-header__public-link" to="/">Volver al sitio público</Link>
        {authenticated && <AdminLogoutButton csrfToken={csrfToken} />}
      </div>
    </header>
  );
}
