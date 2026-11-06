'use strict';
const { sequelize, Encuesta, EncuestaParticipacion, EncuestaRespuesta, EncuestaRespuestaOpcion } = require('../models');
const { publicSurveyWhere } = require('../services/public-survey-policy');
const { surveyGraph } = require('../services/survey-data');
const { fail, normalizeQuestions, CHOICE_TYPES } = require('../services/content-validation');
const { handle } = require('./admin-content.controller');

function validateAnswers(questions, incoming) {
  if (!Array.isArray(incoming) || incoming.length > 100) fail('respuestas debe ser una lista de hasta 100 respuestas.');
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const answers = new Map();
  for (const answer of incoming) {
    if (!answer || Object.keys(answer).some(key => !['pregunta_id', 'valor'].includes(key)) || !Number.isSafeInteger(answer.pregunta_id) || !questionMap.has(answer.pregunta_id)) fail('La pregunta no pertenece a esta encuesta.');
    if (answers.has(answer.pregunta_id)) fail('No se puede repetir una pregunta.');
    answers.set(answer.pregunta_id, answer.valor);
  }
  return questions.flatMap(question => {
    const value = answers.get(question.id);
    const empty = value == null
      || (question.tipo_respuesta === 'texto' && typeof value === 'string' && !value.trim())
      || (question.tipo_respuesta === 'opcion_multiple' && Array.isArray(value) && value.length === 0);
    if (empty) { if (question.obligatoria) fail(`Responde la pregunta obligatoria: ${question.texto}`); return []; }
    const row = { pregunta_id: question.id, valor_texto: null, valor_numerico: null, opciones: [] };
    if (question.tipo_respuesta === 'texto') {
      if (typeof value !== 'string' || value.trim().length > 5000) fail('La respuesta de texto debe tener como máximo 5000 caracteres.');
      row.valor_texto = value.trim();
    } else if (['numerica', 'escala'].includes(question.tipo_respuesta)) {
      if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 99999999.99 || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) fail('La respuesta numérica debe ser finita y tener como máximo dos decimales.');
      if (question.tipo_respuesta === 'escala' && !Number.isInteger(value)) fail('La escala requiere un valor entero.');
      if ((question.valor_minimo != null && value < question.valor_minimo) || (question.valor_maximo != null && value > question.valor_maximo)) fail('La respuesta está fuera del rango permitido.');
      row.valor_numerico = value;
    } else if (CHOICE_TYPES.includes(question.tipo_respuesta)) {
      const ids = question.tipo_respuesta === 'opcion_multiple' ? value : [value];
      if (!Array.isArray(ids) || ids.length > question.opciones.length || !ids.length || new Set(ids).size !== ids.length || ids.some(id => !Number.isSafeInteger(id) || !question.opciones.some(option => option.id === id))) fail('Cada opción debe pertenecer a su pregunta y no repetirse.');
      row.opciones = ids;
    } else fail('Tipo de pregunta no compatible.');
    return [row];
  });
}

module.exports = async function submitAnonymousSurvey(req, res) {
  try {
    if (!req.body || Object.keys(req.body).some(key => key !== 'respuestas')) fail('Envía únicamente la lista de respuestas anónimas.');
    await sequelize.transaction(async transaction => {
      // El mismo bloqueo del editor impide que cambie el cuestionario durante el envío.
      const survey = await Encuesta.findOne({ where: publicSurveyWhere(req.params.slug), transaction, lock: transaction.LOCK.UPDATE });
      if (!survey) fail('Encuesta pública no encontrada o fuera de vigencia.', 404);
      if (!survey.permite_anonimas) fail('Esta encuesta no admite respuestas anónimas.', 403);
      const graph = await surveyGraph(survey.id, transaction);
      normalizeQuestions(graph, true); // Rechaza configuraciones antiguas inválidas, incluidos límites nulos.
      const rows = validateAnswers(graph, req.body.respuestas);
      const participation = await EncuestaParticipacion.create({ encuesta_id: survey.id, contacto_id: null, iniciada_en: new Date(), enviada_en: new Date(), fuente: 'web_anonima' }, { transaction });
      for (const row of rows) {
        const answer = await EncuestaRespuesta.create({ participacion_id: participation.id, pregunta_id: row.pregunta_id, valor_texto: row.valor_texto, valor_numerico: row.valor_numerico }, { transaction });
        for (const id of row.opciones) await EncuestaRespuestaOpcion.create({ respuesta_id: answer.id, opcion_id: id }, { transaction });
      }
    });
    return res.status(201).json({ success: true, message: 'Tus respuestas se guardaron de forma anónima.' });
  } catch (error) { return handle(error, res); }
};
