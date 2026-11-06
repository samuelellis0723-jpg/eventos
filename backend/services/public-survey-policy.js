'use strict';
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const today = sequelize.literal('CURRENT_DATE');
function publicWindow(startField, endField) {
  return { [Op.and]: [
    { [Op.or]: [{ [startField]: null }, { [startField]: { [Op.lte]: today } }] },
    { [Op.or]: [{ [endField]: null }, { [endField]: { [Op.gte]: today } }] }
  ] };
}
function publicSurveyWhere(slug) {
  return { ...(slug ? { slug } : {}), estado: 'publicado', publica: true, ...publicWindow('fecha_inicio', 'fecha_fin') };
}
module.exports = { publicWindow, publicSurveyWhere };
