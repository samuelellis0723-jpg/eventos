import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import EmptyState from '../components/empty-state.jsx';
import RequestState from '../components/request-state.jsx';
import PaginationControls from '../components/pagination-controls.jsx';
import ContentFields from '../components/admin/content-fields.jsx';
import SurveyEditor from '../components/admin/survey-editor.jsx';
import BenefitsEditor from '../components/admin/benefits-editor.jsx';
import useApiResource from '../hooks/use-api-resource.js';
import { adminApiFetch } from '../services/api.js';
import { contentConfig, publicationOptions, toApiData, toEditorData } from '../services/admin-content-config.js';

export default function AdminContentPage({ kind }) {
  const config = contentConfig[kind];
  const session = useOutletContext();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const saving = useRef(false);
  const list = useApiResource(`/admin/${kind}?page=${page}&limit=10`);
  const detail = useApiResource(selectedId ? `/admin/${kind}/${selectedId}` : null);
  const newLabel = `Nuev${['encuestas','promociones'].includes(kind) ? 'a' : 'o'} ${config.singular}`;

  useEffect(() => {
    if (detail.status === 'success' && detail.data) setDraft(toEditorData(kind, detail.data));
  }, [detail.status, detail.data, kind]);

  function createNew() {
    setSelectedId(null);
    setDraft(structuredClone(config.defaults));
    setError(''); setMessage('');
  }
  function edit(id) {
    setSelectedId(id); setDraft(null); setError(''); setMessage('');
  }
  function update(name, value) {
    setDraft(current => ({ ...current, [name]: value }));
    setMessage('');
  }
  async function save(event) {
    event.preventDefault();
    if (saving.current || !draft) return;
    saving.current = true; setPending(true); setError(''); setMessage('');
    try {
      const values = toApiData(kind, draft);
      if (event.nativeEvent.submitter?.value === 'publish') values[config.publicationField] = 'publicado';
      const response = await adminApiFetch(`/admin/${kind}${draft.id ? `/${draft.id}` : ''}`, { method: draft.id ? 'PUT' : 'POST', body: JSON.stringify(values) }, session?.csrfToken);
      setDraft(toEditorData(kind, response.data));
      setSelectedId(response.data.id);
      setMessage(response.data[config.publicationField] === 'publicado' ? 'Contenido publicado. Su visibilidad pública depende también de la vigencia y configuración.' : 'Cambios guardados.');
      list.retry();
    } catch (requestError) { setError(requestError.message || 'No se pudieron guardar los cambios.'); }
    finally { saving.current = false; setPending(false); }
  }

  return (
    <div className="admin-content-page">
      <header className="admin-page-heading admin-content-heading">
        <p className="admin-eyebrow">Gestión de contenido</p>
        <h1>{config.title}</h1>
      </header>
      <div className="content-management-layout">
        <section className="content-records" aria-label={`Listado de ${config.title.toLowerCase()}`}>
          <div className="content-records-heading"><h2>Registros</h2><button className="admin-button admin-button--primary" type="button" onClick={createNew} disabled={pending}>{newLabel}</button></div>
          <RequestState status={list.status} label={config.title.toLowerCase()} onRetry={list.retry} />
          {list.status === 'success' && !list.data?.length && <EmptyState title="Todavía no hay registros" description="Crea el primer borrador para comenzar." action={newLabel} onAction={createNew} />}
          {list.status === 'success' && <div className="content-record-list">{(list.data || []).map(record => (
            <button className={`content-record${record.id === selectedId ? ' content-record--selected' : ''}`} type="button" key={record.id} onClick={() => edit(record.id)} aria-pressed={record.id === selectedId} disabled={pending}>
              <span className="content-record__title">{record.nombre || record.titulo}</span>
              <span>{publicationOptions.find(([value]) => value === record[config.publicationField])?.[1] || record[config.publicationField]}</span>
              <span className="content-record__identifier">{record.slug || record.codigo}</span>
            </button>
          ))}</div>}
          <PaginationControls pagination={list.pagination} label={config.title.toLowerCase()} onPageChange={setPage} />
        </section>
        <section className="content-editor-panel" id="content-editor" aria-label={`Editor de ${config.singular}`}>
          {!draft && selectedId && <RequestState status={detail.status} label={`el ${config.singular}`} onRetry={detail.retry} />}
          {!draft && !selectedId && <EmptyState title="Elige un registro para editar" description="También puedes crear un borrador nuevo." action={newLabel} onAction={createNew} />}
          {draft && <form className="content-editor-form" onSubmit={save} aria-busy={pending}>
            <header className="content-editor-heading"><h2>{draft.id ? `Editar ${config.singular}` : newLabel}</h2><p>Los campos con * son obligatorios.</p></header>
            {error && <p className="admin-notice admin-notice--error" role="alert">{error}</p>}
            {message && <p className="admin-notice" role="status">{message}</p>}
            <fieldset className="content-editor-fieldset" disabled={pending}>
              <legend className="sr-only">Datos de {config.singular}</legend>
              <ContentFields fields={config.fields} data={draft} onChange={update} />
              {kind === 'lealtad' && <BenefitsEditor benefits={draft.beneficios || []} onChange={value => update('beneficios',value)} />}
              {kind === 'encuestas' && <SurveyEditor questions={draft.preguntas || []} locked={draft.tiene_respuestas} onChange={value => update('preguntas',value)} />}
              <div className="content-save-actions">
                <button className="admin-button admin-button--secondary" type="submit" value="save">{pending ? 'Guardando…' : draft[config.publicationField] === 'borrador' ? 'Guardar borrador' : 'Guardar cambios'}</button>
                <button className="admin-button admin-button--primary" type="submit" value="publish">Publicar</button>
              </div>
            </fieldset>
          </form>}
        </section>
      </div>
    </div>
  );
}
