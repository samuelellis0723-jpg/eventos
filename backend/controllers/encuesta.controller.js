'use strict';
const { Encuesta, Empleado, EncuestaPregunta, EncuestaOpcion } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.estado) where.estado = req.query.estado;
      if (req.query.publica !== undefined) where.publica = req.query.publica === 'true';

      const { count, rows } = await Encuesta.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] }],
        order: [['creada_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const encuesta = await Encuesta.findByPk(id, {
        include: [
          { model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] },
          {
            model: EncuestaPregunta,
            as: 'preguntas',
            include: [{ model: EncuestaOpcion, as: 'opciones' }]
          }
        ]
      });
      if (!encuesta) {
        return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
      }
      return res.status(200).json({ success: true, data: encuesta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const encuesta = await Encuesta.findOne({
        where: { slug },
        include: [
          {
            model: EncuestaPregunta,
            as: 'preguntas',
            include: [{ model: EncuestaOpcion, as: 'opciones' }]
          }
        ]
      });
      if (!encuesta) {
        return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
      }
      return res.status(200).json({ success: true, data: encuesta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { slug, titulo, introduccion, tipo, estado, publica, permite_anonimas, fecha_inicio, fecha_fin, creada_por } = req.body;
      if (!slug || !titulo || !tipo || !creada_por) {
        return res.status(400).json({
          success: false,
          message: 'slug, titulo, tipo y creada_por son obligatorios'
        });
      }
      const nueva = await Encuesta.create({
        slug,
        titulo,
        introduccion,
        tipo,
        estado: estado || 'borrador',
        publica: publica !== undefined ? publica : false,
        permite_anonimas: permite_anonimas !== undefined ? permite_anonimas : false,
        fecha_inicio,
        fecha_fin,
        creada_por
      });
      return res.status(201).json({ success: true, message: 'Encuesta creada exitosamente', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const encuesta = await Encuesta.findByPk(id);
      if (!encuesta) {
        return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
      }
      const { slug, titulo, introduccion, tipo, estado, publica, permite_anonimas, fecha_inicio, fecha_fin } = req.body;
      await encuesta.update({
        slug,
        titulo,
        introduccion,
        tipo,
        estado,
        publica,
        permite_anonimas,
        fecha_inicio,
        fecha_fin
      });
      return res.status(200).json({ success: true, message: 'Encuesta actualizada', data: encuesta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const encuesta = await Encuesta.findByPk(id);
      if (!encuesta) {
        return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
      }
      await encuesta.destroy();
      return res.status(200).json({ success: true, message: 'Encuesta eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
