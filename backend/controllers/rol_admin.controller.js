'use strict';
const { RolAdmin, UsuarioAdmin } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const { count, rows } = await RolAdmin.findAndCountAll({
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
      const rol = await RolAdmin.findByPk(id, {
        include: [{ model: UsuarioAdmin, as: 'usuarios', attributes: ['id', 'empleado_id', 'proveedor_auth', 'activo'] }]
      });
      if (!rol) {
        return res.status(404).json({ success: false, message: 'Rol administrativo no encontrado' });
      }
      return res.status(200).json({ success: true, data: rol });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { codigo, nombre, descripcion } = req.body;
      if (!codigo || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Los campos codigo y nombre son obligatorios'
        });
      }
      const nuevoRol = await RolAdmin.create({ codigo, nombre, descripcion });
      return res.status(201).json({ success: true, message: 'Rol creado exitosamente', data: nuevoRol });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const rol = await RolAdmin.findByPk(id);
      if (!rol) {
        return res.status(404).json({ success: false, message: 'Rol administrativo no encontrado' });
      }
      const { codigo, nombre, descripcion } = req.body;
      await rol.update({ codigo, nombre, descripcion });
      return res.status(200).json({ success: true, message: 'Rol actualizado exitosamente', data: rol });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const rol = await RolAdmin.findByPk(id);
      if (!rol) {
        return res.status(404).json({ success: false, message: 'Rol administrativo no encontrado' });
      }
      await rol.destroy();
      return res.status(200).json({ success: true, message: 'Rol eliminado exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
