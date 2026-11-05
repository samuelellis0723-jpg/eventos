export default function EventCard({ event, index }) {
  return (
    <article className="event-card">
      <div className="event-card__top">
        <span className="sample-label">Ejemplo ficticio</span>
        <span className="event-card__index" aria-hidden="true">0{index + 1}</span>
      </div>
      <p className="event-card__date">
        <time dateTime={event.dateTime}>{event.date}</time>
        <span>Fecha de ejemplo</span>
      </p>
      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p>{event.description}</p>
      </div>
      <details className="card-disclosure">
        <summary>Ver información de ejemplo</summary>
        <p>{event.details}</p>
      </details>
    </article>
  );
}
