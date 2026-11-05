'use strict';
const { PromocionCanje, Promocion, Contacto, Cupon, Empleado } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.promocion_id) where.promocion_id = req.query.promocion_id;
      if (req.query.contacto_id) where.contacto_id = req.query.contacto_id;

      const { count, rows } = await PromocionCanje.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: Promocion, as: 'promocion', attributes: ['id', 'nombre', 'slug'] },
          { model: Contacto, as: 'contacto', attributes: ['id', 'nombre', 'correo'] },
          { model: Cupon, as: 'cupon', attributes: ['id', 'codigo'] }
        ],
        order: [['canjeado_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const canje = await PromocionCanje.findByPk(id, {
        include: [
          { model: Promocion, as: 'promocion' },
          { model: Contacto, as: 'contacto' },
          { model: Cupon, as: 'cupon' },
          { model: Empleado, as: 'registrador', attributes: ['id', 'nombre', 'apellidos'] }
        ]
      });
      if (!canje) {
        return res.status(404).json({ success: false, message: 'Registro de canje no encontrado' });
      }
      return res.status(200).json({ success: true, data: canje });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async registrar(req, res) {
    try {
      const { promocion_id, contacto_id, cupon_id, referencia_poliza, registrado_por } = req.body;
      if (!promocion_id || !contacto_id) {
        return res.status(400).json({
          success: false,
          message: 'promocion_id y contacto_id son obligatorios'
        });
      }

      // Si viene un cupón, verificar y actualizar estado a canjeado
      if (cupon_id) {
        const cupon = await Cupon.findByPk(cupon_id);
        if (!cupon) {
          return res.status(404).json({ success: false, message: 'El cupón indicado no existe' });
        }
        if (cupon.estado === 'canjeado' || cupon.estado === 'anulado' || cupon.estado === 'vencido') {
          return res.status(400).json({ success: false, message: `El cupón no puede canjearse en estado: ${cupon.estado}` });
        }
        await cupon.update({ estado: 'canjeado' });
      }

      const nuevoCanje = await PromocionCanje.create({
        promocion_id,
        contacto_id,
        cupon_id,
        referencia_poliza,
        registrado_por
      });
      return res.status(201).json({ success: true, message: 'Canje de promoción registrado', data: nuevoCanje });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
