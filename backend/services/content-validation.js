'use strict';

const PUBLICATION_STATES = ['borrador', 'en_revision', 'programado', 'publicado', 'pausado', 'archivado'];
const QUESTION_TYPES = ['texto', 'numerica', 'escala', 'opcion_unica', 'opcion_multiple', 'si_no'];
const CHOICE_TYPES = ['opcion_unica', 'opcion_multiple', 'si_no'];

function fail(message, status = 422) { const error = new Error(message); error.status = status; throw error; }
function text(value, label, max, required = false) {
  if (value == null || value === '') { if (required) fail(`${label} es obligatorio.`); return null; }
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail(`${label}: texto válido de hasta ${max} caracteres.`);
  return value.trim();
}
function enumeration(value, values, label) { if (!values.includes(value)) fail(`${label} no es válido.`); return value; }
function boolean(value, label) { if (typeof value !== 'boolean') fail(`${label} debe ser verdadero o falso.`); return value; }
function date(value, label, required = false, timestamp = false) {
  if (value == null || value === '') { if (required) fail(`${label} es obligatoria.`); return null; }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value) || !Number.isFinite(Date.parse(value))) fail(`${label} no es válida.`);
  if (new Date(value.slice(0, 10)).toISOString().slice(0, 10) !== value.slice(0, 10)) fail(`${label} no es válida.`);
  if (!timestamp && !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`${label} requiere formato AAAA-MM-DD.`);
  return timestamp ? new Date(value) : value;
}
function windowDates(data, timestamp = false, required = false) {
  data.fecha_inicio = date(data.fecha_inicio instanceof Date ? data.fecha_inicio.toISOString() : data.fecha_inicio, 'Fecha de inicio', required, timestamp);
  data.fecha_fin = date(data.fecha_fin instanceof Date ? data.fecha_fin.toISOString() : data.fecha_fin, 'Fecha de fin', required && !timestamp, timestamp);
  if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) > new Date(data.fecha_fin)) fail('La fecha de fin no puede ser anterior a la fecha de inicio.');
}
function bound(value, label) {
  if (value == null || value === '') return null;
  if (!Number.isInteger(value) || value < -32768 || value > 32767) fail(`${label} debe ser un entero entre -32768 y 32767.`);
  return value;
}
function validScale(question) {
  return question.valor_minimo != null && question.valor_maximo != null
    && Number.isInteger(question.valor_minimo) && Number.isInteger(question.valor_maximo)
    && question.valor_minimo < question.valor_maximo && question.valor_maximo - question.valor_minimo <= 100;
}
function normalizeQuestions(questions, publishing = false) {
  if (!Array.isArray(questions) || questions.length > 100) fail('La encuesta admite hasta 100 preguntas.');
  if (publishing && questions.length === 0) fail('Agrega al menos una pregunta antes de publicar.');
  const ids = new Set();
  return questions.map((question, index) => {
    if (!question || typeof question !== 'object') fail('Pregunta inválida.');
    if (question.id != null && (!Number.isSafeInteger(question.id) || question.id < 1 || ids.has(question.id))) fail('Identificador de pregunta inválido o repetido.');
    if (question.id) ids.add(question.id);
    const q = {
      ...(question.id ? { id: question.id } : {}),
      texto: text(question.texto, 'Texto de pregunta', 500, true),
      tipo_respuesta: enumeration(question.tipo_respuesta, QUESTION_TYPES, 'Tipo de respuesta'),
      obligatoria: boolean(question.obligatoria ?? true, 'Pregunta obligatoria'),
      orden: index + 1,
      valor_minimo: bound(question.valor_minimo, 'Límite mínimo'),
      valor_maximo: bound(question.valor_maximo, 'Límite máximo')
    };
    if (q.valor_minimo != null && q.valor_maximo != null && q.valor_minimo > q.valor_maximo) fail('Los límites de la pregunta están invertidos.');
    if (q.tipo_respuesta === 'escala' && ((publishing && !validScale(q)) || (q.valor_minimo != null && q.valor_maximo != null && !validScale(q)))) fail('Una escala requiere límites enteros, mínimo menor que máximo y como máximo 101 valores.');
    if (!['escala', 'numerica'].includes(q.tipo_respuesta) && (q.valor_minimo != null || q.valor_maximo != null)) fail('Solo las preguntas numéricas y escalas admiten límites.');
    const options = question.opciones ?? [];
    if (!Array.isArray(options) || options.length > 50) fail('Cada pregunta admite hasta 50 opciones.');
    if (!CHOICE_TYPES.includes(q.tipo_respuesta) && options.length) fail('Este tipo de pregunta no admite opciones.');
    const values = new Set();
    const optionIds = new Set();
    q.opciones = options.map((option, optionIndex) => {
      if (!option || typeof option !== 'object') fail('Opción inválida.');
      if (option.id != null && (!Number.isSafeInteger(option.id) || option.id < 1 || optionIds.has(option.id))) fail('Identificador de opción inválido o repetido.');
      if (option.id) optionIds.add(option.id);
      const value = text(option.valor, 'Valor de opción', 100, true);
      if (values.has(value)) fail('Los valores de las opciones no pueden repetirse.');
      values.add(value);
      return { ...(option.id ? { id: option.id } : {}), etiqueta: text(option.etiqueta, 'Etiqueta de opción', 200, true), valor: value, orden: optionIndex + 1 };
    });
    if (publishing && CHOICE_TYPES.includes(q.tipo_respuesta) && q.opciones.length < 2) fail('Las preguntas de selección requieren al menos dos opciones.');
    if (publishing && q.tipo_respuesta === 'si_no' && q.opciones.length !== 2) fail('Una pregunta sí/no requiere exactamente dos opciones.');
    return q;
  });
}

module.exports = { PUBLICATION_STATES, QUESTION_TYPES, CHOICE_TYPES, fail, text, enumeration, boolean, windowDates, validScale, normalizeQuestions };
