'use strict';
const { EncuestaOpcion, EncuestaPregunta } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.pregunta_id) where.pregunta_id = req.query.pregunta_id;

      const { count, rows } = await EncuestaOpcion.findAndCountAll({
        where,
        limit,
        offset,
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
      const opcion = await EncuestaOpcion.findByPk(id, {
        include: [{ model: EncuestaPregunta, as: 'pregunta' }]
      });
      if (!opcion) {
        return res.status(404).json({ success: false, message: 'Opción no encontrada' });
      }
      return res.status(200).json({ success: true, data: opcion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { pregunta_id, etiqueta, valor, orden } = req.body;
      if (!pregunta_id || !etiqueta || !valor || orden === undefined) {
        return res.status(400).json({
          success: false,
          message: 'pregunta_id, etiqueta, valor y orden son obligatorios'
        });
      }
      const nueva = await EncuestaOpcion.create({ pregunta_id, etiqueta, valor, orden });
      return res.status(201).json({ success: true, message: 'Opción creada exitosamente', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const opcion = await EncuestaOpcion.findByPk(id);
      if (!opcion) {
        return res.status(404).json({ success: false, message: 'Opción no encontrada' });
      }
      const { etiqueta, valor, orden } = req.body;
      await opcion.update({ etiqueta, valor, orden });
      return res.status(200).json({ success: true, message: 'Opción actualizada', data: opcion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const opcion = await EncuestaOpcion.findByPk(id);
      if (!opcion) {
        return res.status(404).json({ success: false, message: 'Opción no encontrada' });
      }
      await opcion.destroy();
      return res.status(200).json({ success: true, message: 'Opción eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
