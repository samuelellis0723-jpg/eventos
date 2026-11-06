export default function LoyaltyBenefitCard({ benefit }) {
  return (
    <article className="loyalty-benefit-card">
      <span className="sample-label">Beneficio activo</span>
      <div>
        <h3>{benefit.nombre}</h3>
        {benefit.descripcion && <p>{benefit.descripcion}</p>}
        <p className="loyalty-benefit-card__points">{benefit.puntos_requeridos} puntos requeridos</p>
      </div>
    </article>
  );
}
