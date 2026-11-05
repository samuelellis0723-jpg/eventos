'use strict';
const { UsuarioAdminRol, UsuarioAdmin, RolAdmin, Empleado } = require('../models');
const { handleSequelizeError } = require('./helpers');

module.exports = {
  async asignarRol(req, res) {
    try {
      const { usuario_admin_id, rol_admin_id } = req.body;
      if (!usuario_admin_id || !rol_admin_id) {
        return res.status(400).json({
          success: false,
          message: 'usuario_admin_id y rol_admin_id son obligatorios'
        });
      }
      const asignacion = await UsuarioAdminRol.create({ usuario_admin_id, rol_admin_id });
      return res.status(201).json({ success: true, message: 'Rol asignado exitosamente', data: asignacion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async removerRol(req, res) {
    try {
      const { usuario_admin_id, rol_admin_id } = req.body;
      if (!usuario_admin_id || !rol_admin_id) {
        return res.status(400).json({
          success: false,
          message: 'usuario_admin_id y rol_admin_id son obligatorios'
        });
      }
      const deleted = await UsuarioAdminRol.destroy({
        where: { usuario_admin_id, rol_admin_id }
      });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Asignación de rol no encontrada' });
      }
      return res.status(200).json({ success: true, message: 'Rol removido del usuario exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getRolesPorUsuario(req, res) {
    try {
      const { usuario_admin_id } = req.params;
      const roles = await UsuarioAdminRol.findAll({
        where: { usuario_admin_id },
        include: [{ model: RolAdmin, as: 'rol_admin' }]
      });
      return res.status(200).json({ success: true, data: roles });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getUsuariosPorRol(req, res) {
    try {
      const { rol_admin_id } = req.params;
      const usuarios = await UsuarioAdminRol.findAll({
        where: { rol_admin_id },
        include: [{ model: UsuarioAdmin, as: 'usuario_admin', include: [{ model: Empleado, as: 'empleado' }] }]
      });
      return res.status(200).json({ success: true, data: usuarios });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
