'use strict';
const { EncuestaPregunta, EncuestaOpcion } = require('../models');
async function surveyGraph(id, transaction) {
  const questions = await EncuestaPregunta.findAll({ where: { encuesta_id: id }, transaction, order: [['orden', 'ASC'], ['id', 'ASC']] });
  return Promise.all(questions.map(async question => ({ ...question.get({ plain: true }), opciones: (await EncuestaOpcion.findAll({ where: { pregunta_id: question.id }, transaction, order: [['orden', 'ASC'], ['id', 'ASC']] })).map(row => row.get({ plain: true })) })));
}
module.exports = { surveyGraph };
