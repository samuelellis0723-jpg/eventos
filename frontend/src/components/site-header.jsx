import { Link } from 'react-router';

export default function SiteHeader() {
  return (
    <header className="site-header-wrap">
      <div className="site-header page-shell">
        <Link className="brand" to="/" aria-label="Eventos y Mercadeo, inicio">
          <span className="brand__mark" aria-hidden="true">E</span>
          <span>Eventos<span className="brand__accent">+</span></span>
        </Link>
        <nav className="site-nav" aria-label="Navegación principal">
          <Link className="site-nav__active" to="/" aria-current="page">Inicio</Link>
          <span className="site-nav__pending" aria-disabled="true">
            Lealtad<span className="site-nav__status">Próximamente</span>
          </span>
          <span className="site-nav__pending" aria-disabled="true">
            Encuestas<span className="site-nav__status">Próximamente</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
