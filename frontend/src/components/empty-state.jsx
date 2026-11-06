export default function EmptyState({
  title,
  description,
  href,
  action,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {onAction
        ? <button className="text-link api-state__retry" type="button" onClick={onAction}>{action}</button>
        : <a className="text-link" href={href}>{action}</a>}
    </div>
  );
}
