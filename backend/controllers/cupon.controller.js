'use strict';
const { Cupon, Promocion, Contacto } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.promocion_id) where.promocion_id = req.query.promocion_id;
      if (req.query.estado) where.estado = req.query.estado;
      if (req.query.contacto_asignado_id) where.contacto_asignado_id = req.query.contacto_asignado_id;

      const { count, rows } = await Cupon.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: Promocion, as: 'promocion', attributes: ['id', 'nombre', 'slug'] },
          { model: Contacto, as: 'contacto_asignado', attributes: ['id', 'nombre', 'correo'] }
        ],
        order: [['creado_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const cupon = await Cupon.findByPk(id, {
        include: [
          { model: Promocion, as: 'promocion' },
          { model: Contacto, as: 'contacto_asignado' }
        ]
      });
      if (!cupon) {
        return res.status(404).json({ success: false, message: 'Cupón no encontrado' });
      }
      return res.status(200).json({ success: true, data: cupon });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getByCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const cupon = await Cupon.findOne({
        where: { codigo },
        include: [
          { model: Promocion, as: 'promocion' },
          { model: Contacto, as: 'contacto_asignado' }
        ]
      });
      if (!cupon) {
        return res.status(404).json({ success: false, message: 'Cupón no encontrado para el código provisto' });
      }
      return res.status(200).json({ success: true, data: cupon });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { promocion_id, codigo, contacto_asignado_id, estado, vence_en } = req.body;
      if (!promocion_id || !codigo) {
        return res.status(400).json({ success: false, message: 'promocion_id y codigo son obligatorios' });
      }
      const nuevo = await Cupon.create({
        promocion_id,
        codigo,
        contacto_asignado_id,
        estado: estado || 'disponible',
        vence_en
      });
      return res.status(201).json({ success: true, message: 'Cupón creado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const cupon = await Cupon.findByPk(id);
      if (!cupon) {
        return res.status(404).json({ success: false, message: 'Cupón no encontrado' });
      }
      const { contacto_asignado_id, estado, vence_en } = req.body;
      await cupon.update({ contacto_asignado_id, estado, vence_en });
      return res.status(200).json({ success: true, message: 'Cupón actualizado', data: cupon });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const cupon = await Cupon.findByPk(id);
      if (!cupon) {
        return res.status(404).json({ success: false, message: 'Cupón no encontrado' });
      }
      await cupon.destroy();
      return res.status(200).json({ success: true, message: 'Cupón eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
