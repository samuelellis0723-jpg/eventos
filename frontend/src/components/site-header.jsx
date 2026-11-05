import { Link } from 'react-router';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Eventos y Mercadeo, inicio">
        <span className="brand__mark" aria-hidden="true">E</span>
        <span>Eventos<span className="brand__accent">+</span></span>
      </Link>
      <nav className="site-nav" aria-label="Navegación principal">
        <a href="/#eventos">Eventos</a>
        <a href="/#contenido">Contenido</a>
        <a href="/#promociones">Promociones</a>
      </nav>
    </header>
  );
}
