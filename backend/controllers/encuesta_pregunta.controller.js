'use strict';
const { EncuestaPregunta, Encuesta, EncuestaOpcion } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.encuesta_id) where.encuesta_id = req.query.encuesta_id;

      const { count, rows } = await EncuestaPregunta.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: EncuestaOpcion, as: 'opciones' }],
        order: [['orden', 'ASC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const pregunta = await EncuestaPregunta.findByPk(id, {
        include: [
          { model: Encuesta, as: 'encuesta', attributes: ['id', 'titulo', 'slug'] },
          { model: EncuestaOpcion, as: 'opciones' }
        ]
      });
      if (!pregunta) {
        return res.status(404).json({ success: false, message: 'Pregunta de encuesta no encontrada' });
      }
      return res.status(200).json({ success: true, data: pregunta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { encuesta_id, texto, tipo_respuesta, obligatoria, orden, valor_minimo, valor_maximo } = req.body;
      if (!encuesta_id || !texto || !tipo_respuesta || orden === undefined) {
        return res.status(400).json({
          success: false,
          message: 'encuesta_id, texto, tipo_respuesta y orden son obligatorios'
        });
      }
      const nueva = await EncuestaPregunta.create({
        encuesta_id,
        texto,
        tipo_respuesta,
        obligatoria: obligatoria !== undefined ? obligatoria : true,
        orden,
        valor_minimo,
        valor_maximo
      });
      return res.status(201).json({ success: true, message: 'Pregunta creada exitosamente', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const pregunta = await EncuestaPregunta.findByPk(id);
      if (!pregunta) {
        return res.status(404).json({ success: false, message: 'Pregunta no encontrada' });
      }
      const { texto, tipo_respuesta, obligatoria, orden, valor_minimo, valor_maximo } = req.body;
      await pregunta.update({ texto, tipo_respuesta, obligatoria, orden, valor_minimo, valor_maximo });
      return res.status(200).json({ success: true, message: 'Pregunta actualizada', data: pregunta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const pregunta = await EncuestaPregunta.findByPk(id);
      if (!pregunta) {
        return res.status(404).json({ success: false, message: 'Pregunta no encontrada' });
      }
      await pregunta.destroy();
      return res.status(200).json({ success: true, message: 'Pregunta eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
