import { Link, useLocation } from 'react-router';

const modules = [
  { label: 'Eventos', status: 'Próximamente' },
  { label: 'Promociones', status: 'Próximamente' },
  { label: 'Lealtad', status: 'Próximamente' },
  { label: 'Encuestas', status: 'Próximamente' },
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
        <span className="admin-module-nav__status">Activo</span>
      </Link>
      {modules.map((module, index) => (
        <button className="admin-module-nav__item admin-module-nav__item--disabled" type="button" disabled key={module.label}>
          <span className="admin-module-nav__label"><span>{String(index + 1).padStart(2, '0')} /</span> {module.label}</span>
          <span className="admin-module-nav__status">{module.status}</span>
        </button>
      ))}
    </nav>
  );
}
