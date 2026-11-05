export default function EmptyState({
  title,
  description,
  href,
  action,
}) {
  return (
    <div className="empty-state">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <a className="text-link" href={href}>{action}</a>
    </div>
  );
}
