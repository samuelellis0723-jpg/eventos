export default function PromotionCard({ promotion }) {
  return (
    <article className="promotion-card">
      <div className="promotion-card__top">
        <span className="sample-label">Promoción de ejemplo</span>
      </div>
      <div className="promotion-card__body">
        <h3>{promotion.title}</h3>
        <p>{promotion.description}</p>
      </div>
      <p className="promotion-card__validity">{promotion.validity}</p>
      <details className="card-disclosure">
        <summary>Ver condiciones de ejemplo</summary>
        <p>{promotion.details}</p>
      </details>
    </article>
  );
}
