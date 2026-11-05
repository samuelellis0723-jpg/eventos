'use strict';
const { BeneficioLealtad, ProgramaLealtad, ActivoCreativo } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.programa_id) where.programa_id = req.query.programa_id;
      if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

      const { count, rows } = await BeneficioLealtad.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: ActivoCreativo, as: 'imagen', attributes: ['id', 'url_archivo'] }
        ],
        order: [['puntos_requeridos', 'ASC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const beneficio = await BeneficioLealtad.findByPk(id, {
        include: [
          { model: ProgramaLealtad, as: 'programa' },
          { model: ActivoCreativo, as: 'imagen' }
        ]
      });
      if (!beneficio) {
        return res.status(404).json({ success: false, message: 'Beneficio de lealtad no encontrado' });
      }
      return res.status(200).json({ success: true, data: beneficio });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { programa_id, nombre, descripcion, puntos_requeridos, existencias, imagen_id, activo } = req.body;
      if (!programa_id || !nombre || puntos_requeridos === undefined) {
        return res.status(400).json({
          success: false,
          message: 'programa_id, nombre y puntos_requeridos son obligatorios'
        });
      }
      const nuevo = await BeneficioLealtad.create({
        programa_id,
        nombre,
        descripcion,
        puntos_requeridos,
        existencias,
        imagen_id,
        activo: activo !== undefined ? activo : true
      });
      return res.status(201).json({ success: true, message: 'Beneficio de lealtad creado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const beneficio = await BeneficioLealtad.findByPk(id);
      if (!beneficio) {
        return res.status(404).json({ success: false, message: 'Beneficio de lealtad no encontrado' });
      }
      const { nombre, descripcion, puntos_requeridos, existencias, imagen_id, activo } = req.body;
      await beneficio.update({ nombre, descripcion, puntos_requeridos, existencias, imagen_id, activo });
      return res.status(200).json({ success: true, message: 'Beneficio actualizado', data: beneficio });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const beneficio = await BeneficioLealtad.findByPk(id);
      if (!beneficio) {
        return res.status(404).json({ success: false, message: 'Beneficio de lealtad no encontrado' });
      }
      await beneficio.destroy();
      return res.status(200).json({ success: true, message: 'Beneficio eliminado exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
