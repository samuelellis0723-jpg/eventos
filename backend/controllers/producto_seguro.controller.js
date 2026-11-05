'use strict';
const { ProductoSeguro, RamoSeguro, Promocion } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.ramo_id) where.ramo_id = req.query.ramo_id;
      if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

      const { count, rows } = await ProductoSeguro.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: RamoSeguro, as: 'ramo' }],
        order: [['id', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductoSeguro.findByPk(id, {
        include: [
          { model: RamoSeguro, as: 'ramo' },
          { model: Promocion, as: 'promociones', through: { attributes: [] } }
        ]
      });
      if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto de seguro no encontrado' });
      }
      return res.status(200).json({ success: true, data: producto });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { ramo_id, codigo, nombre, descripcion, activo } = req.body;
      if (!ramo_id || !codigo || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'ramo_id, codigo y nombre son obligatorios'
        });
      }
      const nuevo = await ProductoSeguro.create({
        ramo_id,
        codigo,
        nombre,
        descripcion,
        activo: activo !== undefined ? activo : true
      });
      return res.status(201).json({ success: true, message: 'Producto de seguro creado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductoSeguro.findByPk(id);
      if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto de seguro no encontrado' });
      }
      const { ramo_id, codigo, nombre, descripcion, activo } = req.body;
      await producto.update({ ramo_id, codigo, nombre, descripcion, activo });
      return res.status(200).json({ success: true, message: 'Producto actualizado', data: producto });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductoSeguro.findByPk(id);
      if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto de seguro no encontrado' });
      }
      await producto.destroy();
      return res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
