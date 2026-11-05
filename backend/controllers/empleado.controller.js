'use strict';
const { Empleado, UsuarioAdmin } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

      const { count, rows } = await Empleado.findAndCountAll({
        where,
        limit,
        offset,
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
      const empleado = await Empleado.findByPk(id, {
        include: [{ model: UsuarioAdmin, as: 'usuario_admin' }]
      });
      if (!empleado) {
        return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      }
      return res.status(200).json({ success: true, data: empleado });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { nombre, apellidos, correo, puesto, activo } = req.body;
      if (!nombre || !apellidos || !correo) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, apellidos y correo son obligatorios'
        });
      }
      const nuevoEmpleado = await Empleado.create({
        nombre,
        apellidos,
        correo,
        puesto,
        activo: activo !== undefined ? activo : true
      });
      return res.status(201).json({ success: true, message: 'Empleado creado exitosamente', data: nuevoEmpleado });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const empleado = await Empleado.findByPk(id);
      if (!empleado) {
        return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      }
      const { nombre, apellidos, correo, puesto, activo } = req.body;
      await empleado.update({ nombre, apellidos, correo, puesto, activo });
      return res.status(200).json({ success: true, message: 'Empleado actualizado exitosamente', data: empleado });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const empleado = await Empleado.findByPk(id);
      if (!empleado) {
        return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
      }
      await empleado.destroy();
      return res.status(200).json({ success: true, message: 'Empleado eliminado exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
