'use strict';
const { EncuestaParticipacion, Encuesta, Contacto, EncuestaRespuesta } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.encuesta_id) where.encuesta_id = req.query.encuesta_id;
      if (req.query.contacto_id) where.contacto_id = req.query.contacto_id;

      const { count, rows } = await EncuestaParticipacion.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: Encuesta, as: 'encuesta', attributes: ['id', 'titulo'] },
          { model: Contacto, as: 'contacto', attributes: ['id', 'nombre', 'correo'] }
        ],
        order: [['iniciada_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const participacion = await EncuestaParticipacion.findByPk(id, {
        include: [
          { model: Encuesta, as: 'encuesta' },
          { model: Contacto, as: 'contacto' },
          { model: EncuestaRespuesta, as: 'respuestas' }
        ]
      });
      if (!participacion) {
        return res.status(404).json({ success: false, message: 'Participación no encontrada' });
      }
      return res.status(200).json({ success: true, data: participacion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async iniciar(req, res) {
    try {
      const { encuesta_id, contacto_id, fuente } = req.body;
      if (!encuesta_id) {
        return res.status(400).json({ success: false, message: 'encuesta_id es obligatorio' });
      }
      const nueva = await EncuestaParticipacion.create({
        encuesta_id,
        contacto_id: contacto_id || null,
        fuente
      });
      return res.status(201).json({ success: true, message: 'Participación iniciada', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async enviar(req, res) {
    try {
      const { id } = req.params;
      const participacion = await EncuestaParticipacion.findByPk(id);
      if (!participacion) {
        return res.status(404).json({ success: false, message: 'Participación no encontrada' });
      }
      await participacion.update({ enviada_en: new Date() });
      return res.status(200).json({ success: true, message: 'Participación finalizada y enviada', data: participacion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
