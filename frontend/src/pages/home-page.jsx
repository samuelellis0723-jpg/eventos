import SiteFooter from '../components/site-footer.jsx';
import SiteHeader from '../components/site-header.jsx';

const sections = [
  { id: 'eventos', title: 'Eventos', description: 'Aquí se mostrarán los próximos eventos.' },
  { id: 'contenido', title: 'Contenido', description: 'Aquí se mostrarán artículos y novedades.' },
  { id: 'promociones', title: 'Promociones', description: 'Aquí se mostrarán las promociones vigentes.' },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Eventos y mercadeo</p>
          <h1 id="hero-title">Ideas, eventos y novedades en un solo lugar</h1>
          <p className="hero__description">
            Explora el contenido y las actividades disponibles. Esta página usa texto de ejemplo y
            todavía no está conectada a la API.
          </p>
          <a className="button" href="#eventos">Explorar eventos</a>
        </section>

        <section className="section" aria-labelledby="discover-title">
          <div className="section__heading">
            <p className="eyebrow">Descubre</p>
            <h2 id="discover-title">Información para explorar</h2>
          </div>
          <div className="section-grid">
            {sections.map((section) => (
              <article className="info-card" id={section.id} key={section.id}>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <span className="info-card__note">Contenido temporal</span>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
