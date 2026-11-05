'use strict';
const { EventoSesion, EventoMercadeo, Expositor } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.evento_id) where.evento_id = req.query.evento_id;

      const { count, rows } = await EventoSesion.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Expositor, as: 'expositores', through: { attributes: [] } }],
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
      const sesion = await EventoSesion.findByPk(id, {
        include: [
          { model: EventoMercadeo, as: 'evento', attributes: ['id', 'nombre', 'slug'] },
          { model: Expositor, as: 'expositores', through: { attributes: [] } }
        ]
      });
      if (!sesion) {
        return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
      }
      return res.status(200).json({ success: true, data: sesion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { evento_id, titulo, descripcion, fecha_inicio, fecha_fin, orden } = req.body;
      if (!evento_id || !titulo || !fecha_inicio || orden === undefined) {
        return res.status(400).json({
          success: false,
          message: 'evento_id, titulo, fecha_inicio y orden son obligatorios'
        });
      }
      const nueva = await EventoSesion.create({
        evento_id,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        orden
      });
      return res.status(201).json({ success: true, message: 'Sesión del evento creada', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const sesion = await EventoSesion.findByPk(id);
      if (!sesion) {
        return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
      }
      const { titulo, descripcion, fecha_inicio, fecha_fin, orden } = req.body;
      await sesion.update({ titulo, descripcion, fecha_inicio, fecha_fin, orden });
      return res.status(200).json({ success: true, message: 'Sesión actualizada', data: sesion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const sesion = await EventoSesion.findByPk(id);
      if (!sesion) {
        return res.status(404).json({ success: false, message: 'Sesión no encontrada' });
      }
      await sesion.destroy();
      return res.status(200).json({ success: true, message: 'Sesión eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
