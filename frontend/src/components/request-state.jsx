export default function RequestState({ status, label, onRetry }) {
  if (status === 'loading') {
    return <p className="api-state" role="status">Cargando {label}…</p>;
  }

  if (status === 'error') {
    return (
      <div className="api-state api-state--error" role="alert">
        <p>No se pudo cargar {label}.</p>
        <button className="text-link api-state__retry" type="button" onClick={onRetry}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return null;
}
