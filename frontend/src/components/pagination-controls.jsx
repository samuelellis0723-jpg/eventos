export default function PaginationControls({ pagination, label, onPageChange }) {
  if (!pagination || pagination.totalPages < 2) return null;

  return (
    <nav className="pagination-controls" aria-label={`Paginación de ${label}`}>
      <button
        className="text-link pagination-controls__button"
        type="button"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Anterior
      </button>
      <span aria-live="polite">
        Página {pagination.page} de {pagination.totalPages} · {pagination.total} resultados
      </span>
      <button
        className="text-link pagination-controls__button"
        type="button"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
