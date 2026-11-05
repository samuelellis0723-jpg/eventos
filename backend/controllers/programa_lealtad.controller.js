'use strict';
const { ProgramaLealtad, BeneficioLealtad, Empleado, Contacto } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.estado) where.estado = req.query.estado;

      const { count, rows } = await ProgramaLealtad.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: BeneficioLealtad, as: 'beneficios' }],
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
      const programa = await ProgramaLealtad.findByPk(id, {
        include: [
          { model: BeneficioLealtad, as: 'beneficios' },
          { model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] }
        ]
      });
      if (!programa) {
        return res.status(404).json({ success: false, message: 'Programa de lealtad no encontrado' });
      }
      return res.status(200).json({ success: true, data: programa });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { codigo, nombre, descripcion, condiciones, estado, fecha_inicio, fecha_fin, creado_por } = req.body;
      if (!codigo || !nombre || !creado_por) {
        return res.status(400).json({
          success: false,
          message: 'codigo, nombre y creado_por son obligatorios'
        });
      }
      const nuevo = await ProgramaLealtad.create({
        codigo,
        nombre,
        descripcion,
        condiciones,
        estado: estado || 'borrador',
        fecha_inicio,
        fecha_fin,
        creado_por
      });
      return res.status(201).json({ success: true, message: 'Programa de lealtad creado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const programa = await ProgramaLealtad.findByPk(id);
      if (!programa) {
        return res.status(404).json({ success: false, message: 'Programa de lealtad no encontrado' });
      }
      const { codigo, nombre, descripcion, condiciones, estado, fecha_inicio, fecha_fin } = req.body;
      await programa.update({ codigo, nombre, descripcion, condiciones, estado, fecha_inicio, fecha_fin });
      return res.status(200).json({ success: true, message: 'Programa de lealtad actualizado', data: programa });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const programa = await ProgramaLealtad.findByPk(id);
      if (!programa) {
        return res.status(404).json({ success: false, message: 'Programa de lealtad no encontrado' });
      }
      await programa.destroy();
      return res.status(200).json({ success: true, message: 'Programa de lealtad eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
