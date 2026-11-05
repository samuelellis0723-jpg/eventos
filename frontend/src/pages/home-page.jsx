import EmptyState from '../components/empty-state.jsx';
import EventCard from '../components/event-card.jsx';
import PromotionCard from '../components/promotion-card.jsx';
import SiteFooter from '../components/site-footer.jsx';
import SiteHeader from '../components/site-header.jsx';
import { sampleEvents, samplePromotions } from '../mocks/home-content.js';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <p className="preview-banner page-shell">
          Vista previa: todos los eventos, fechas y promociones son ejemplos ficticios.
        </p>

        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">Eventos y Mercadeo</p>
            <h1 id="hero-title">Tu próxima experiencia empieza aquí.</h1>
            <p className="hero__description">
              Explora actividades y descubre promociones desde un mismo lugar.
            </p>
            <div className="hero__actions">
              <a className="button" href="#eventos">Ver eventos</a>
              <a className="text-link" href="#promociones">Ver promociones</a>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <span className="hero__visual-mark">E<span>+</span></span>
            <span className="hero__visual-tile" />
          </div>
        </section>

        <section className="section page-shell" id="eventos" aria-labelledby="events-title">
          <div className="section__heading">
            <span className="section__number" aria-hidden="true">01</span>
            <div>
              <p className="eyebrow">Agenda</p>
              <h2 id="events-title">Eventos destacados</h2>
              <p className="section__intro">
                Fechas y descripciones de muestra; aquí aparecerán los eventos publicados.
              </p>
            </div>
          </div>

          {sampleEvents.length > 0 ? (
            <div className="event-grid">
              {sampleEvents.map((event, index) => (
                <EventCard event={event} index={index} key={event.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay eventos publicados por ahora"
              description="Vuelve a consultar esta sección cuando se publique la próxima agenda."
              href="#promociones"
              action="Ver promociones"
            />
          )}
        </section>

        <section
          className="section section--promotions page-shell"
          id="promociones"
          aria-labelledby="promotions-title"
        >
          <div className="section__heading">
            <span className="section__number" aria-hidden="true">02</span>
            <div>
              <p className="eyebrow">Beneficios</p>
              <h2 id="promotions-title">Promociones</h2>
              <p className="section__intro">
                Ejemplos de cómo se presentarán los beneficios y sus periodos de vigencia.
              </p>
            </div>
          </div>

          {samplePromotions.length > 0 ? (
            <div className="promotion-grid">
              {samplePromotions.map((promotion) => (
                <PromotionCard promotion={promotion} key={promotion.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay promociones disponibles por ahora"
              description="En esta sección se mostrarán las promociones cuando estén publicadas."
              href="#eventos"
              action="Ver eventos"
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
