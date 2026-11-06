import { useState } from 'react';
import EmptyState from '../components/empty-state.jsx';
import LoyaltyBenefitCard from '../components/loyalty-benefit-card.jsx';
import PaginationControls from '../components/pagination-controls.jsx';
import RequestState from '../components/request-state.jsx';
import SiteFooter from '../components/site-footer.jsx';
import SiteHeader from '../components/site-header.jsx';
import useApiResource from '../hooks/use-api-resource.js';

const PAGE_SIZE = 6;

export default function LoyaltyPage() {
  const [page, setPage] = useState(1);
  const programsRequest = useApiResource(`/public/programas-lealtad?page=${page}&limit=${PAGE_SIZE}`);
  const programs = programsRequest.data || [];

  return (
    <>
      <SiteHeader />
      <main>
        <p className="preview-banner page-shell">
          Información de programas publicados y vigentes, con sus beneficios activos.
        </p>

        <section className="hero page-shell loyalty-hero" aria-labelledby="loyalty-title">
          <div className="hero__copy">
            <p className="eyebrow">Lealtad</p>
            <h1 id="loyalty-title">Conoce los programas y sus beneficios.</h1>
            <p className="hero__description">
              Consulta los programas públicos de lealtad y sus beneficios activos.
            </p>
            <div className="hero__actions">
              <a className="button" href="#beneficios">Ver beneficios</a>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <span className="hero__visual-mark">E<span>+</span></span>
            <span className="hero__visual-tile" />
          </div>
        </section>

        <section className="section page-shell loyalty-program" aria-labelledby="program-title">
          <span className="section__number" aria-hidden="true">01</span>
          <div>
            <p className="eyebrow">Lealtad</p>
            <h2 id="program-title">Sobre los programas</h2>
          </div>
          <p className="loyalty-program__description">
            La información se actualiza desde los programas publicados y vigentes.
          </p>
          {programsRequest.status === 'success' && programs.length > 0 && (
            <div className="loyalty-program-list">
              {programs.map((program, index) => (
                <article className="loyalty-program-item" key={program.id}>
                  <span className="eyebrow">Programa {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, '0')}</span>
                  <h3>{program.nombre}</h3>
                  {program.descripcion && <p>{program.descripcion}</p>}
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="section page-shell section--loyalty-benefits"
          id="beneficios"
          aria-labelledby="benefits-title"
        >
          <div className="section__heading">
            <span className="section__number" aria-hidden="true">02</span>
            <div>
              <p className="eyebrow">Lealtad</p>
              <h2 id="benefits-title">Beneficios</h2>
              <p className="section__intro">Beneficios que están activos en cada programa.</p>
            </div>
          </div>

          <RequestState
            status={programsRequest.status}
            label="programas de lealtad"
            onRetry={programsRequest.retry}
          />
          {programsRequest.status === 'success' && programs.length === 0 && (
            <EmptyState
              title="No hay programas de lealtad disponibles por ahora"
              description="Los programas publicados y vigentes aparecerán aquí."
              href="/"
              action="Volver a Inicio"
            />
          )}
          {programsRequest.status === 'success' && programs.length > 0 && (
            <div className="loyalty-program-benefits">
              {programs.map((program) => (
                <section className="loyalty-benefit-group" key={program.id} aria-labelledby={`benefits-${program.id}`}>
                  <h3 id={`benefits-${program.id}`}>{program.nombre}</h3>
                  {(program.beneficios || []).length > 0 ? (
                    <div className="loyalty-benefit-grid">
                      {program.beneficios.map((benefit) => (
                        <LoyaltyBenefitCard benefit={benefit} key={benefit.id} />
                      ))}
                    </div>
                  ) : (
                    <p className="loyalty-benefit-group__empty">Este programa no tiene beneficios activos publicados.</p>
                  )}
                </section>
              ))}
            </div>
          )}
          {programsRequest.status === 'success' && (
            <PaginationControls
              pagination={programsRequest.pagination}
              label="programas de lealtad"
              onPageChange={setPage}
            />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
