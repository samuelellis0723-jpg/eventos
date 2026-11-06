import { formatPublicDate } from '../services/format-date.js';

export default function PromotionCard({ promotion }) {
  const description = promotion.resumen || promotion.descripcion || '';

  return (
    <article className="promotion-card">
      <div className="promotion-card__top">
        <span className="sample-label">Promoción publicada</span>
      </div>
      <div className="promotion-card__body">
        <h3>{promotion.nombre}</h3>
        {description && <p>{description}</p>}
      </div>
      <p className="promotion-card__validity">
        Vigencia: {formatPublicDate(promotion.fecha_inicio)} – {formatPublicDate(promotion.fecha_fin)}
      </p>
      {promotion.condiciones && (
        <details className="card-disclosure">
          <summary>Ver condiciones</summary>
          <p>{promotion.condiciones}</p>
        </details>
      )}
    </article>
  );
}
