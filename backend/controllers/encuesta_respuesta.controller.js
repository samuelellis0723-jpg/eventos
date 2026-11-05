'use strict';
const { EncuestaRespuesta, EncuestaParticipacion, EncuestaPregunta, EncuestaOpcion } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.participacion_id) where.participacion_id = req.query.participacion_id;
      if (req.query.pregunta_id) where.pregunta_id = req.query.pregunta_id;

      const { count, rows } = await EncuestaRespuesta.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: EncuestaOpcion, as: 'opciones', through: { attributes: [] } }]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const respuesta = await EncuestaRespuesta.findByPk(id, {
        include: [
          { model: EncuestaPregunta, as: 'pregunta' },
          { model: EncuestaOpcion, as: 'opciones', through: { attributes: [] } }
        ]
      });
      if (!respuesta) {
        return res.status(404).json({ success: false, message: 'Respuesta no encontrada' });
      }
      return res.status(200).json({ success: true, data: respuesta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { participacion_id, pregunta_id, valor_texto, valor_numerico } = req.body;
      if (!participacion_id || !pregunta_id) {
        return res.status(400).json({
          success: false,
          message: 'participacion_id y pregunta_id son obligatorios'
        });
      }
      const nueva = await EncuestaRespuesta.create({
        participacion_id,
        pregunta_id,
        valor_texto,
        valor_numerico
      });
      return res.status(201).json({ success: true, message: 'Respuesta registrada', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
