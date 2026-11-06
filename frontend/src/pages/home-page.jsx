import { useState } from 'react';
import EmptyState from '../components/empty-state.jsx';
import EventCard from '../components/event-card.jsx';
import PaginationControls from '../components/pagination-controls.jsx';
import PromotionCard from '../components/promotion-card.jsx';
import RequestState from '../components/request-state.jsx';
import SiteFooter from '../components/site-footer.jsx';
import SiteHeader from '../components/site-header.jsx';
import useApiResource from '../hooks/use-api-resource.js';

const PAGE_SIZE = 6;

export default function HomePage() {
  const [eventPage, setEventPage] = useState(1);
  const [promotionPage, setPromotionPage] = useState(1);
  const eventsRequest = useApiResource(`/public/eventos?page=${eventPage}&limit=${PAGE_SIZE}`);
  const promotionsRequest = useApiResource(`/public/promociones?page=${promotionPage}&limit=${PAGE_SIZE}`);
  const events = eventsRequest.data || [];
  const promotions = promotionsRequest.data || [];

  return (
    <>
      <SiteHeader />
      <main>
        <p className="preview-banner page-shell">
          Información pública de eventos publicados y promociones vigentes.
        </p>

        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">Eventos y Mercadeo</p>
            <h1 id="hero-title">Tu próxima experiencia empieza aquí.</h1>
            <p className="hero__description">
              Explora actividades publicadas y consulta las promociones vigentes.
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
              <h2 id="events-title">Eventos publicados</h2>
              <p className="section__intro">
                Eventos con publicación pública, con su estado, fecha y descripción.
              </p>
            </div>
          </div>

          <RequestState status={eventsRequest.status} label="eventos" onRetry={eventsRequest.retry} />
          {eventsRequest.status === 'success' && events.length > 0 && (
            <div className="event-grid">
              {events.map((event, index) => (
                <EventCard event={event} index={(eventPage - 1) * PAGE_SIZE + index} key={event.id} />
              ))}
            </div>
          )}
          {eventsRequest.status === 'success' && events.length === 0 && (
            <EmptyState
              title="No hay eventos publicados por ahora"
              description="Vuelve a consultar esta sección cuando se publique la próxima agenda."
              href="#promociones"
              action="Ver promociones"
            />
          )}
          {eventsRequest.status === 'success' && (
            <PaginationControls
              pagination={eventsRequest.pagination}
              label="eventos"
              onPageChange={setEventPage}
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
                Promociones publicadas dentro de su periodo de vigencia.
              </p>
            </div>
          </div>

          <RequestState status={promotionsRequest.status} label="promociones" onRetry={promotionsRequest.retry} />
          {promotionsRequest.status === 'success' && promotions.length > 0 && (
            <div className="promotion-grid">
              {promotions.map((promotion) => (
                <PromotionCard promotion={promotion} key={promotion.id} />
              ))}
            </div>
          )}
          {promotionsRequest.status === 'success' && promotions.length === 0 && (
            <EmptyState
              title="No hay promociones disponibles por ahora"
              description="En esta sección se mostrarán las promociones cuando estén publicadas y vigentes."
              href="#eventos"
              action="Ver eventos"
            />
          )}
          {promotionsRequest.status === 'success' && (
            <PaginationControls
              pagination={promotionsRequest.pagination}
              label="promociones"
              onPageChange={setPromotionPage}
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
