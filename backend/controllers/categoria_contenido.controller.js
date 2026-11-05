'use strict';
const { CategoriaContenido, ContenidoPublico } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.activa !== undefined) where.activa = req.query.activa === 'true';

      const { count, rows } = await CategoriaContenido.findAndCountAll({
        where,
        limit,
        offset,
        order: [['id', 'ASC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaContenido.findByPk(id, {
        include: [{ model: ContenidoPublico, as: 'contenidos', through: { attributes: [] } }]
      });
      if (!categoria) {
        return res.status(404).json({ success: false, message: 'Categoría de contenido no encontrada' });
      }
      return res.status(200).json({ success: true, data: categoria });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion, activa } = req.body;
      if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
      }
      const nueva = await CategoriaContenido.create({
        nombre,
        descripcion,
        activa: activa !== undefined ? activa : true
      });
      return res.status(201).json({ success: true, message: 'Categoría creada', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaContenido.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ success: false, message: 'Categoría de contenido no encontrada' });
      }
      const { nombre, descripcion, activa } = req.body;
      await categoria.update({ nombre, descripcion, activa });
      return res.status(200).json({ success: true, message: 'Categoría actualizada', data: categoria });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaContenido.findByPk(id);
      if (!categoria) {
        return res.status(404).json({ success: false, message: 'Categoría de contenido no encontrada' });
      }
      await categoria.destroy();
      return res.status(200).json({ success: true, message: 'Categoría eliminada exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
