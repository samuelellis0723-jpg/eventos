import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import AdminFooter from '../components/admin/admin-footer.jsx';
import AdminHeader from '../components/admin/admin-header.jsx';
import { getAdminCsrfToken, loginAdmin } from '../services/api.js';

export default function AdminLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const csrfToken = await getAdminCsrfToken();
      await loginAdmin({ correo, contrasena }, csrfToken);
      setContrasena('');
      const requestedPath = location.state?.returnTo;
      const destination = requestedPath?.startsWith('/admin/') && requestedPath !== '/admin/login'
        ? requestedPath
        : '/admin';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.');
      setPending(false);
    }
  }

  const notice = location.state?.expired
    ? 'Tu sesión expiró. Inicia sesión para continuar.'
    : location.state?.signedOut ? 'La sesión se cerró.' : '';

  return (
    <div className="admin-app admin-auth-app">
      <AdminHeader />
      <main className="admin-auth-main page-shell">
        <section className="admin-auth-form-section" aria-labelledby="admin-login-title">
          <p className="admin-eyebrow">Acceso administrativo</p>
          <h1 id="admin-login-title">Inicia sesión</h1>
          <p className="admin-auth-intro">Acceso al panel de gestión de Eventos+.</p>

          {notice && <p className="admin-notice" role="status">{notice}</p>}
          {error && <p className="admin-notice admin-notice--error" role="alert">{error}</p>}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="admin-email">Correo electrónico</label>
              <input
                id="admin-email"
                name="correo"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                required
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                disabled={pending}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">Contraseña</label>
              <div className="admin-password-field">
                <input
                  id="admin-password"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  disabled={pending}
                />
                <button
                  className="admin-password-toggle"
                  type="button"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={pending}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <button className="admin-button admin-button--primary admin-login-submit" type="submit" disabled={pending}>
              {pending ? 'Iniciando sesión…' : 'Entrar al panel'}
            </button>
          </form>
          <Link className="admin-back-link" to="/">Volver al sitio público</Link>
        </section>

        <aside className="admin-auth-aside">
          <span className="admin-auth-aside__mark" aria-hidden="true">E+</span>
          <div>
            <p className="admin-eyebrow">Eventos+</p>
            <h2>Administración</h2>
            <p>Este espacio está destinado a cuentas autorizadas para administrar el sitio.</p>
          </div>
        </aside>
      </main>
      <AdminFooter />
    </div>
  );
}
