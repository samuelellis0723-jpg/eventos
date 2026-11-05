'use strict';
const { AuditoriaAccion, UsuarioAdmin } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.entidad) where.entidad = req.query.entidad;
      if (req.query.usuario_admin_id) where.usuario_admin_id = req.query.usuario_admin_id;
      if (req.query.accion) where.accion = req.query.accion;

      const { count, rows } = await AuditoriaAccion.findAndCountAll({
        where,
        limit,
        offset,
        order: [['ocurrido_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const auditoria = await AuditoriaAccion.findByPk(id, {
        include: [{ model: UsuarioAdmin, as: 'usuario_admin', attributes: ['id', 'proveedor_auth', 'subject_auth'] }]
      });
      if (!auditoria) {
        return res.status(404).json({ success: false, message: 'Registro de auditoría no encontrado' });
      }
      return res.status(200).json({ success: true, data: auditoria });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async registrar(req, res) {
    try {
      const { usuario_admin_id, accion, entidad, registro_id, datos_anteriores, datos_nuevos, ip_origen } = req.body;
      if (!usuario_admin_id || !accion || !entidad || !registro_id) {
        return res.status(400).json({
          success: false,
          message: 'usuario_admin_id, accion, entidad y registro_id son obligatorios'
        });
      }
      const nuevo = await AuditoriaAccion.create({
        usuario_admin_id,
        accion,
        entidad,
        registro_id,
        datos_anteriores,
        datos_nuevos,
        ip_origen: ip_origen || req.ip
      });
      return res.status(201).json({ success: true, message: 'Evento de auditoría registrado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
