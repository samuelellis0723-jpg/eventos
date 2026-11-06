'use strict';
const models = require('../models');
const { randomUUID } = require('crypto');
const { sequelize, EventoMercadeo, Promocion, ProgramaLealtad, BeneficioLealtad, Encuesta, EncuestaPregunta, EncuestaOpcion, EncuestaParticipacion } = models;
const { PUBLICATION_STATES, fail, text, enumeration, boolean, windowDates, normalizeQuestions } = require('../services/content-validation');
const { getPagination, formatPaginatedResponse } = require('./helpers');
const { surveyGraph } = require('../services/survey-data');

const definitions = {
  eventos: { Model: EventoMercadeo, fields: ['slug', 'nombre', 'resumen', 'descripcion', 'tipo', 'estado', 'estado_publicacion', 'modalidad', 'lugar', 'url_virtual', 'fecha_inicio', 'fecha_fin', 'destacado_en_inicio'], owner: 'responsable_id' },
  promociones: { Model: Promocion, fields: ['slug', 'nombre', 'resumen', 'descripcion', 'condiciones', 'tipo', 'descuento_pct', 'estado', 'fecha_inicio', 'fecha_fin', 'destacado_en_inicio'], owner: 'creado_por' },
  lealtad: { Model: ProgramaLealtad, fields: ['codigo', 'nombre', 'descripcion', 'condiciones', 'estado', 'fecha_inicio', 'fecha_fin'], owner: 'creado_por' },
  encuestas: { Model: Encuesta, fields: ['slug', 'titulo', 'introduccion', 'tipo', 'estado', 'publica', 'permite_anonimas', 'fecha_inicio', 'fecha_fin'], owner: 'creada_por' }
};
function project(source, fields) { return Object.fromEntries(fields.filter(key => source[key] !== undefined).map(key => [key, source[key]])); }
function validateData(kind, source) {
  const data = project(source, definitions[kind].fields);
  if (kind === 'encuestas') {
    data.titulo = text(data.titulo, 'Título', 150, true);
    data.introduccion = text(data.introduccion, 'Introducción', 20000);
    data.tipo = enumeration(data.tipo, ['nps', 'satisfaccion', 'conocimiento_marca', 'estudio_mercado', 'post_venta'], 'Tipo de encuesta');
    data.publica = boolean(data.publica ?? false, 'Visibilidad pública');
    data.permite_anonimas = boolean(data.permite_anonimas ?? false, 'Respuestas anónimas');
  } else {
    data.nombre = text(data.nombre, 'Nombre', kind === 'lealtad' ? 120 : 150, true);
    data.descripcion = text(data.descripcion, 'Descripción', 20000);
  }
  if (kind === 'lealtad') data.codigo = text(data.codigo, 'Código', 40, true);
  else {
    data.slug = text(data.slug, 'Slug', 180, true);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) fail('El slug solo admite minúsculas, números y guiones entre palabras.');
  }
  if (['eventos', 'promociones'].includes(kind)) {
    data.resumen = text(data.resumen, 'Resumen', 500);
    data.destacado_en_inicio = boolean(data.destacado_en_inicio ?? false, 'Destacado en Inicio');
  }
  if (kind === 'eventos') {
    data.tipo = enumeration(data.tipo, ['feria', 'webinar', 'charla', 'patrocinio', 'otro'], 'Tipo de evento');
    data.estado = enumeration(data.estado ?? 'planificado', ['planificado', 'en_curso', 'realizado', 'cancelado'], 'Estado del evento');
    data.estado_publicacion = enumeration(data.estado_publicacion ?? 'borrador', PUBLICATION_STATES, 'Estado de publicación');
    data.modalidad = enumeration(data.modalidad, ['presencial', 'virtual', 'hibrido'], 'Modalidad');
    data.lugar = text(data.lugar, 'Lugar', 200);
    data.url_virtual = text(data.url_virtual, 'Enlace virtual', 500);
    if (data.url_virtual) { try { if (!['http:', 'https:'].includes(new URL(data.url_virtual).protocol)) fail('El enlace virtual debe usar HTTP o HTTPS.'); } catch { fail('El enlace virtual no es válido.'); } }
  } else data.estado = enumeration(data.estado ?? 'borrador', PUBLICATION_STATES, 'Estado de publicación');
  if (kind === 'promociones') {
    data.tipo = enumeration(data.tipo, ['descuento_prima', 'beneficio_adicional', 'puntos_extra', 'otro'], 'Tipo de promoción');
    data.condiciones = text(data.condiciones, 'Condiciones', 20000);
    if (data.descuento_pct != null && !['string', 'number'].includes(typeof data.descuento_pct)) fail('El descuento debe ser numérico.');
    const discount = data.descuento_pct == null || data.descuento_pct === '' ? null : Number(data.descuento_pct);
    if (discount != null && (!Number.isFinite(discount) || discount < 0 || discount > 100 || Math.abs(discount * 100 - Math.round(discount * 100)) > 0.000001)) fail('El descuento debe estar entre 0 y 100, con hasta dos decimales.');
    data.descuento_pct = discount;
  }
  if (kind === 'lealtad') data.condiciones = text(data.condiciones, 'Condiciones', 20000);
  windowDates(data, kind === 'eventos', ['eventos', 'promociones'].includes(kind));
  return data;
}
function semantics(questions) {
  return JSON.stringify(questions.map(q => ({ ...project(q, ['id', 'texto', 'tipo_respuesta', 'obligatoria', 'valor_minimo', 'valor_maximo']), opciones: q.opciones.map(o => project(o, ['id', 'etiqueta', 'valor'])).sort((a,b) => a.id - b.id) })).sort((a,b) => a.id - b.id));
}
async function saveQuestions(survey, incoming, transaction) {
  const current = await surveyGraph(survey.id, transaction);
  if (incoming === undefined) {
    if (survey.estado === 'publicado') normalizeQuestions(current, true);
    return; // Los cambios de metadatos no reescriben preguntas ni opciones.
  }
  const next = normalizeQuestions(incoming ?? current, survey.estado === 'publicado');
  const hasResponses = await EncuestaParticipacion.count({ where: { encuesta_id: survey.id }, transaction });
  if (hasResponses && semantics(normalizeQuestions(current)) !== semantics(next)) fail('Esta encuesta ya tiene participaciones. Las preguntas y opciones se conservan; crea otra encuesta para cambiar su significado.', 409);
  const currentById = new Map(current.map(q => [q.id, q]));
  const kept = new Set();
  for (const q of next) {
    let row;
    if (q.id) {
      if (!currentById.has(q.id)) fail('La pregunta no pertenece a esta encuesta.');
      row = await EncuestaPregunta.findByPk(q.id, { transaction });
      await row.update(project(q, ['texto', 'tipo_respuesta', 'obligatoria', 'orden', 'valor_minimo', 'valor_maximo']), { transaction });
    } else row = await EncuestaPregunta.create({ ...project(q, ['texto', 'tipo_respuesta', 'obligatoria', 'orden', 'valor_minimo', 'valor_maximo']), encuesta_id: survey.id }, { transaction });
    kept.add(row.id);
    const oldOptions = currentById.get(q.id)?.opciones || [];
    const keepOptions = new Set(q.opciones.filter(o => o.id).map(o => o.id));
    for (const old of oldOptions) if (!keepOptions.has(old.id)) await EncuestaOpcion.destroy({ where: { id: old.id }, transaction });
    // Evita colisiones al reordenar/cambiar valores únicos sin respuestas previas.
    const temporaryPrefix = randomUUID();
    for (const option of q.opciones) if (option.id) {
      if (!oldOptions.some(old => old.id === option.id)) fail('La opción no pertenece a esta pregunta.');
      await EncuestaOpcion.update({ valor: '__editing_' + temporaryPrefix + '_' + option.id }, { where: { id: option.id }, transaction });
    }
    for (const option of q.opciones) {
      const values = { etiqueta: option.etiqueta, valor: option.valor, orden: option.orden };
      if (option.id) await EncuestaOpcion.update(values, { where: { id: option.id }, transaction });
      else await EncuestaOpcion.create({ ...values, pregunta_id: row.id }, { transaction });
    }
  }
  for (const question of current) if (!kept.has(question.id)) await EncuestaPregunta.destroy({ where: { id: question.id }, transaction });
}
async function saveBenefits(program, incoming, transaction) {
  if (!Array.isArray(incoming) || incoming.length > 100) fail('Los beneficios deben ser una lista de hasta 100 elementos.');
  const current = await BeneficioLealtad.findAll({ where: { programa_id: program.id }, transaction });
  const kept = new Set();
  for (const item of incoming) {
    if (item.id != null && (!Number.isSafeInteger(item.id) || kept.has(item.id))) fail('Beneficio inválido o repetido.');
    const values = { nombre: text(item.nombre, 'Nombre de beneficio', 150, true), descripcion: text(item.descripcion, 'Descripción de beneficio', 20000), activo: boolean(item.activo ?? true, 'Beneficio activo') };
    if (item.id) {
      const existing = current.find(row => row.id === item.id);
      if (!existing) fail('El beneficio no pertenece al programa.');
      await existing.update(values, { transaction });
      kept.add(item.id);
    } else {
      const created = await BeneficioLealtad.create({ ...values, programa_id: program.id, puntos_requeridos: 0 }, { transaction });
      kept.add(created.id);
    }
  }
  for (const existing of current) if (!kept.has(existing.id)) await existing.update({ activo: false }, { transaction });
}
async function detail(kind, id, transaction) {
  const def = definitions[kind];
  const row = await def.Model.findByPk(id, { attributes: ['id', ...def.fields], transaction });
  if (!row) fail('Registro no encontrado.', 404);
  const data = row.get({ plain: true });
  if (kind === 'encuestas') {
    data.preguntas = await surveyGraph(id, transaction);
    data.tiene_respuestas = Boolean(await EncuestaParticipacion.count({ where: { encuesta_id: id }, transaction }));
  }
  if (kind === 'lealtad') data.beneficios = await BeneficioLealtad.findAll({ where: { programa_id: id }, attributes: ['id', 'nombre', 'descripcion', 'activo'], order: [['id', 'ASC']], transaction });
  return data;
}
function handle(error, res) {
  const status = error.status || (error.name === 'SequelizeUniqueConstraintError' ? 409 : error.name?.startsWith('Sequelize') ? 400 : 500);
  return res.status(status).json({ success: false, message: error.status ? error.message : status === 409 ? 'Ya existe un registro con ese slug o código.' : status === 400 ? 'Los datos no cumplen las restricciones del registro.' : 'No se pudo completar la operación.' });
}
function handlers(kind) {
  const def = definitions[kind];
  return {
    async list(req, res) {
      try { const { page, limit, offset } = getPagination(req); const { count, rows } = await def.Model.findAndCountAll({ attributes: ['id', ...def.fields], limit, offset, order: [['id', 'DESC']] }); return res.json(formatPaginatedResponse(count, rows, page, limit)); } catch (error) { return handle(error, res); }
    },
    async get(req, res) { try { return res.json({ success: true, data: await detail(kind, req.params.id) }); } catch (error) { return handle(error, res); } },
    async save(req, res) {
      try {
        const id = await sequelize.transaction(async transaction => {
          const existing = req.params.id ? await def.Model.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE }) : null;
          if (req.params.id && !existing) fail('Registro no encontrado.', 404);
          const data = validateData(kind, { ...existing?.get({ plain: true }), ...req.body });
          const row = existing ? await existing.update(data, { transaction }) : await def.Model.create({ ...data, [def.owner]: req.adminUser.empleado_id }, { transaction });
          if (kind === 'encuestas') await saveQuestions(row, req.body.preguntas, transaction);
          if (kind === 'lealtad' && req.body.beneficios !== undefined) await saveBenefits(row, req.body.beneficios, transaction);
          return row.id;
        });
        return res.status(req.params.id ? 200 : 201).json({ success: true, data: await detail(kind, id) });
      } catch (error) { return handle(error, res); }
    }
  };
}
const controllers = Object.fromEntries(Object.keys(definitions).map(kind => [kind, handlers(kind)]));
module.exports = { ...controllers, surveyGraph, handle };
