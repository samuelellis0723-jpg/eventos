import { formatPublicDate } from '../services/format-date.js';

const eventStatusLabels = {
  planificado: 'Planificado',
  en_curso: 'En curso',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
};

const modalityLabels = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
};

export default function EventCard({ event, index }) {
  const summary = event.resumen || event.descripcion || '';
  const details = event.descripcion && event.descripcion !== summary ? event.descripcion : '';

  return (
    <article className="event-card">
      <div className="event-card__top">
        <span className="event-state-tag">{eventStatusLabels[event.estado] || event.estado}</span>
        <span className="event-card__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <p className="event-card__date">
        <time dateTime={event.fecha_inicio}>{formatPublicDate(event.fecha_inicio)}</time>
        {event.fecha_fin && <span>Hasta {formatPublicDate(event.fecha_fin)}</span>}
      </p>
      <div className="event-card__body">
        <h3>{event.nombre}</h3>
        {summary && <p>{summary}</p>}
      </div>
      {(event.modalidad || event.lugar) && (
        <p className="event-card__meta">
          {[modalityLabels[event.modalidad] || event.modalidad, event.lugar].filter(Boolean).join(' · ')}
        </p>
      )}
      {details && (
        <details className="card-disclosure">
          <summary>Ver detalles</summary>
          <p>{details}</p>
        </details>
      )}
    </article>
  );
}
