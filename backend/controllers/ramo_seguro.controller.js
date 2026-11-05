'use strict';
const { RamoSeguro, ProductoSeguro } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const { count, rows } = await RamoSeguro.findAndCountAll({
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
      const ramo = await RamoSeguro.findByPk(id, {
        include: [{ model: ProductoSeguro, as: 'productos' }]
      });
      if (!ramo) {
        return res.status(404).json({ success: false, message: 'Ramo de seguro no encontrado' });
      }
      return res.status(200).json({ success: true, data: ramo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
      }
      const nuevo = await RamoSeguro.create({ nombre, descripcion });
      return res.status(201).json({ success: true, message: 'Ramo creado exitosamente', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const ramo = await RamoSeguro.findByPk(id);
      if (!ramo) {
        return res.status(404).json({ success: false, message: 'Ramo no encontrado' });
      }
      const { nombre, descripcion } = req.body;
      await ramo.update({ nombre, descripcion });
      return res.status(200).json({ success: true, message: 'Ramo actualizado', data: ramo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const ramo = await RamoSeguro.findByPk(id);
      if (!ramo) {
        return res.status(404).json({ success: false, message: 'Ramo no encontrado' });
      }
      await ramo.destroy();
      return res.status(200).json({ success: true, message: 'Ramo eliminado exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
