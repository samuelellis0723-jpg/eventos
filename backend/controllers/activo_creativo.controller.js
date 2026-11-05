'use strict';
const { ActivoCreativo, Empleado } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.tipo) where.tipo = req.query.tipo;

      const { count, rows } = await ActivoCreativo.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] }],
        order: [['creado_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const activo = await ActivoCreativo.findByPk(id, {
        include: [{ model: Empleado, as: 'creador' }]
      });
      if (!activo) {
        return res.status(404).json({ success: false, message: 'Activo creativo no encontrado' });
      }
      return res.status(200).json({ success: true, data: activo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { nombre, tipo, url_archivo, texto_alternativo, creado_por } = req.body;
      if (!nombre || !tipo || !url_archivo) {
        return res.status(400).json({
          success: false,
          message: 'nombre, tipo y url_archivo son obligatorios'
        });
      }
      const nuevo = await ActivoCreativo.create({
        nombre,
        tipo,
        url_archivo,
        texto_alternativo,
        creado_por
      });
      return res.status(201).json({ success: true, message: 'Activo creativo registrado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const activo = await ActivoCreativo.findByPk(id);
      if (!activo) {
        return res.status(404).json({ success: false, message: 'Activo creativo no encontrado' });
      }
      const { nombre, tipo, url_archivo, texto_alternativo, creado_por } = req.body;
      await activo.update({ nombre, tipo, url_archivo, texto_alternativo, creado_por });
      return res.status(200).json({ success: true, message: 'Activo actualizado', data: activo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const activo = await ActivoCreativo.findByPk(id);
      if (!activo) {
        return res.status(404).json({ success: false, message: 'Activo creativo no encontrado' });
      }
      await activo.destroy();
      return res.status(200).json({ success: true, message: 'Activo creativo eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
