'use strict';
const { UsuarioAdmin, Empleado, RolAdmin } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

      const { count, rows } = await UsuarioAdmin.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: Empleado, as: 'empleado' },
          { model: RolAdmin, as: 'roles', through: { attributes: [] } }
        ],
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
      const usuario = await UsuarioAdmin.findByPk(id, {
        include: [
          { model: Empleado, as: 'empleado' },
          { model: RolAdmin, as: 'roles', through: { attributes: [] } }
        ]
      });
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario administrativo no encontrado' });
      }
      return res.status(200).json({ success: true, data: usuario });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { empleado_id, proveedor_auth, subject_auth, activo, ultimo_acceso } = req.body;
      if (!empleado_id || !proveedor_auth || !subject_auth) {
        return res.status(400).json({
          success: false,
          message: 'Los campos empleado_id, proveedor_auth y subject_auth son obligatorios'
        });
      }
      const nuevoUsuario = await UsuarioAdmin.create({
        empleado_id,
        proveedor_auth,
        subject_auth,
        activo: activo !== undefined ? activo : true,
        ultimo_acceso
      });
      return res.status(201).json({ success: true, message: 'Usuario administrativo creado', data: nuevoUsuario });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioAdmin.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario administrativo no encontrado' });
      }
      const { proveedor_auth, subject_auth, activo, ultimo_acceso } = req.body;
      await usuario.update({ proveedor_auth, subject_auth, activo, ultimo_acceso });
      return res.status(200).json({ success: true, message: 'Usuario administrativo actualizado', data: usuario });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioAdmin.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario administrativo no encontrado' });
      }
      await usuario.destroy();
      return res.status(200).json({ success: true, message: 'Usuario administrativo eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
