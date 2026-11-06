import { Link, useLocation } from 'react-router';

export default function SiteHeader() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isLoyalty = pathname === '/lealtad';
  const isSurveys = pathname === '/encuestas';

  return (
    <header className="site-header-wrap">
      <div className="site-header page-shell">
        <Link className="brand" to="/" aria-label="Eventos y Mercadeo, inicio">
          <span className="brand__mark" aria-hidden="true">E</span>
          <span>Eventos<span className="brand__accent">+</span></span>
        </Link>
        <nav className="site-nav" aria-label="Navegación principal">
          <Link
            className={isHome ? 'site-nav__active' : 'site-nav__link'}
            to="/"
            aria-current={isHome ? 'page' : undefined}
          >
            Inicio
          </Link>
          <Link
            className={isLoyalty ? 'site-nav__active' : 'site-nav__link'}
            to="/lealtad"
            aria-current={isLoyalty ? 'page' : undefined}
          >
            Lealtad
          </Link>
          <Link
            className={isSurveys ? 'site-nav__active' : 'site-nav__link'}
            to="/encuestas"
            aria-current={isSurveys ? 'page' : undefined}
          >
            Encuestas
          </Link>
        </nav>
      </div>
    </header>
  );
}
