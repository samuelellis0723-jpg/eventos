'use strict';
const { Expositor, ActivoCreativo, EventoSesion } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const { count, rows } = await Expositor.findAndCountAll({
        limit,
        offset,
        include: [{ model: ActivoCreativo, as: 'foto', attributes: ['id', 'url_archivo'] }],
        order: [['nombre', 'ASC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const expositor = await Expositor.findByPk(id, {
        include: [
          { model: ActivoCreativo, as: 'foto' },
          { model: EventoSesion, as: 'sesiones', through: { attributes: [] } }
        ]
      });
      if (!expositor) {
        return res.status(404).json({ success: false, message: 'Expositor no encontrado' });
      }
      return res.status(200).json({ success: true, data: expositor });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { nombre, organizacion, biografia, foto_id } = req.body;
      if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
      }
      const nuevo = await Expositor.create({ nombre, organizacion, biografia, foto_id });
      return res.status(201).json({ success: true, message: 'Expositor registrado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const expositor = await Expositor.findByPk(id);
      if (!expositor) {
        return res.status(404).json({ success: false, message: 'Expositor no encontrado' });
      }
      const { nombre, organizacion, biografia, foto_id } = req.body;
      await expositor.update({ nombre, organizacion, biografia, foto_id });
      return res.status(200).json({ success: true, message: 'Expositor actualizado', data: expositor });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const expositor = await Expositor.findByPk(id);
      if (!expositor) {
        return res.status(404).json({ success: false, message: 'Expositor no encontrado' });
      }
      await expositor.destroy();
      return res.status(200).json({ success: true, message: 'Expositor eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
