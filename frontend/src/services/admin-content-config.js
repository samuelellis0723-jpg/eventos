export const publicationOptions = [
  ['borrador', 'Borrador'], ['en_revision', 'En revisión'], ['programado', 'Programado'],
  ['publicado', 'Publicado'], ['pausado', 'Pausado'], ['archivado', 'Archivado'],
];
const field = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const description = field('descripcion', 'Descripción', 'textarea', { maxLength: 20000, wide: true });
const name = field('nombre', 'Nombre', 'text', { required: true, maxLength: 150 });
const slug = field('slug', 'Slug', 'text', { required: true, maxLength: 180, pattern: '[a-z0-9]+(-[a-z0-9]+)*', hint: 'Minúsculas, números y guiones entre palabras.' });
const state = field('estado', 'Estado de publicación', 'select', { options: publicationOptions });
const dates = [field('fecha_inicio', 'Vigente desde', 'date'), field('fecha_fin', 'Vigente hasta', 'date')];
export const contentConfig = {
  eventos: {
    title: 'Eventos', singular: 'evento', publicationField: 'estado_publicacion',
    defaults: { nombre: '', slug: '', tipo: 'otro', estado: 'planificado', estado_publicacion: 'borrador', modalidad: 'presencial', fecha_inicio: '', fecha_fin: '', destacado_en_inicio: false },
    fields: [name, slug, field('resumen', 'Resumen', 'textarea', { maxLength: 500, wide: true }), description,
      field('tipo', 'Tipo de evento', 'select', { options: [['feria','Feria'],['webinar','Webinar'],['charla','Charla'],['patrocinio','Patrocinio'],['otro','Otro']] }),
      field('modalidad', 'Modalidad', 'select', { options: [['presencial','Presencial'],['virtual','Virtual'],['hibrido','Híbrido']] }),
      field('lugar', 'Lugar', 'text', { maxLength: 200 }), field('url_virtual', 'Enlace virtual', 'url', { maxLength: 500 }),
      field('fecha_inicio', 'Fecha y hora de inicio', 'datetime-local', { required: true }), field('fecha_fin', 'Fecha y hora de fin', 'datetime-local'),
      field('estado', 'Estado del evento', 'select', { options: [['planificado','Planificado'],['en_curso','En curso'],['realizado','Realizado'],['cancelado','Cancelado']] }),
      field('estado_publicacion', 'Estado de publicación', 'select', { options: publicationOptions, hint: 'La publicación es independiente del estado del evento.' }),
      field('destacado_en_inicio', 'Destacar en Inicio', 'checkbox')],
  },
  promociones: {
    title: 'Promociones', singular: 'promoción', publicationField: 'estado',
    defaults: { nombre: '', slug: '', tipo: 'otro', estado: 'borrador', fecha_inicio: '', fecha_fin: '', destacado_en_inicio: false },
    fields: [name, slug, field('resumen', 'Resumen', 'textarea', { maxLength: 500, wide: true }), description,
      field('condiciones', 'Condiciones', 'textarea', { maxLength: 20000, wide: true }),
      field('tipo', 'Tipo de promoción', 'select', { options: [['descuento_prima','Descuento de prima'],['beneficio_adicional','Beneficio adicional'],['puntos_extra','Puntos extra'],['otro','Otro']] }),
      field('descuento_pct', 'Descuento porcentual (opcional)', 'number', { min: 0, max: 100, step: '0.01' }),
      ...dates.map(f => ({ ...f, required: true })), state, field('destacado_en_inicio', 'Destacar en Inicio', 'checkbox')],
  },
  lealtad: {
    title: 'Lealtad', singular: 'programa', publicationField: 'estado',
    defaults: { nombre: '', codigo: '', estado: 'borrador', fecha_inicio: '', fecha_fin: '', beneficios: [] },
    fields: [{ ...name, maxLength: 120 }, field('codigo', 'Código', 'text', { required: true, maxLength: 40 }), description,
      field('condiciones', 'Condiciones', 'textarea', { maxLength: 20000, wide: true }), ...dates, state],
  },
  encuestas: {
    title: 'Encuestas', singular: 'encuesta', publicationField: 'estado',
    defaults: { titulo: '', slug: '', introduccion: '', tipo: 'satisfaccion', estado: 'borrador', publica: false, permite_anonimas: false, fecha_inicio: '', fecha_fin: '', preguntas: [] },
    fields: [field('titulo', 'Título', 'text', { required: true, maxLength: 150 }), slug,
      field('introduccion', 'Introducción', 'textarea', { maxLength: 20000, wide: true }),
      field('tipo', 'Tipo de encuesta', 'select', { options: [['nps','NPS'],['satisfaccion','Satisfacción'],['conocimiento_marca','Conocimiento de marca'],['estudio_mercado','Estudio de mercado'],['post_venta','Postventa']] }),
      state, ...dates, field('publica', 'Visible en el sitio público', 'checkbox'), field('permite_anonimas', 'Permitir respuestas anónimas', 'checkbox')],
  },
};

export function toEditorData(kind, source) {
  const result = { ...source };
  for (const item of contentConfig[kind].fields) {
    if (item.type === 'datetime-local' && source[item.name]) {
      const date = new Date(source[item.name]);
      result[item.name] = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
  }
  return result;
}
export function toApiData(kind, source) {
  const result = { ...source };
  if (kind === 'encuestas' && source.tiene_respuestas) delete result.preguntas;
  for (const item of contentConfig[kind].fields) {
    if (item.type === 'datetime-local') result[item.name] = source[item.name] ? new Date(source[item.name]).toISOString() : null;
  }
  return result;
}
