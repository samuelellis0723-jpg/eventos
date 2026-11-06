import { Link, useLocation } from 'react-router';

const modules = [
  { label: 'Eventos', path: '/admin/eventos' },
  { label: 'Promociones', path: '/admin/promociones' },
  { label: 'Lealtad', path: '/admin/lealtad' },
  { label: 'Encuestas', path: '/admin/encuestas' },
];

export default function AdminModuleNavigation() {
  const { pathname } = useLocation();
  const isPanel = pathname === '/admin' || pathname === '/admin/';

  return (
    <nav className="admin-module-nav" aria-label="Menú de administración">
      <Link
        className={`admin-module-nav__item${isPanel ? ' admin-module-nav__item--active' : ''}`}
        to="/admin"
        aria-current={isPanel ? 'page' : undefined}
      >
        <span className="admin-module-nav__label"><span>00 /</span> Panel</span>
        {isPanel && <span className="admin-module-nav__status">Activo</span>}
      </Link>
      {modules.map((module, index) => (
        <Link className={`admin-module-nav__item${pathname.startsWith(module.path) ? ' admin-module-nav__item--active' : ''}`} to={module.path} aria-current={pathname.startsWith(module.path) ? 'page' : undefined} key={module.label}>
          <span className="admin-module-nav__label"><span>{String(index + 1).padStart(2, '0')} /</span> {module.label}</span>
          {pathname.startsWith(module.path) && <span className="admin-module-nav__status">Activo</span>}
        </Link>
      ))}
    </nav>
  );
}
