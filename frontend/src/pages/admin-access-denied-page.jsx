import { Link } from 'react-router';
import AdminFooter from '../components/admin/admin-footer.jsx';
import AdminHeader from '../components/admin/admin-header.jsx';

export default function AdminAccessDeniedPage({ session }) {
  return (
    <div className="admin-app">
      <AdminHeader authenticated csrfToken={session?.csrfToken} />
      <main className="admin-access-denied page-shell">
        <p className="admin-eyebrow">403 / Acceso denegado</p>
        <h1>Esta cuenta no tiene permisos de administración</h1>
        <p>La sesión está activa, pero no cuenta con el rol requerido para entrar al panel.</p>
        <Link className="admin-button admin-button--secondary" to="/">Volver al sitio público</Link>
      </main>
      <AdminFooter />
    </div>
  );
}
