'use strict';
const { PromocionProducto, Promocion, ProductoSeguro } = require('../models');
const { handleSequelizeError } = require('./helpers');

module.exports = {
  async asociarProducto(req, res) {
    try {
      const { promocion_id, producto_id } = req.body;
      if (!promocion_id || !producto_id) {
        return res.status(400).json({ success: false, message: 'promocion_id y producto_id son obligatorios' });
      }
      const asociacion = await PromocionProducto.create({ promocion_id, producto_id });
      return res.status(201).json({ success: true, message: 'Producto vinculado a promoción', data: asociacion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async desasociarProducto(req, res) {
    try {
      const { promocion_id, producto_id } = req.body;
      if (!promocion_id || !producto_id) {
        return res.status(400).json({ success: false, message: 'promocion_id y producto_id son obligatorios' });
      }
      const deleted = await PromocionProducto.destroy({ where: { promocion_id, producto_id } });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Vínculo promoción-producto no encontrado' });
      }
      return res.status(200).json({ success: true, message: 'Producto desasociado de la promoción' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getProductosPorPromocion(req, res) {
    try {
      const { promocion_id } = req.params;
      const productos = await PromocionProducto.findAll({
        where: { promocion_id },
        include: [{ model: ProductoSeguro, as: 'producto' }]
      });
      return res.status(200).json({ success: true, data: productos });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getPromocionesPorProducto(req, res) {
    try {
      const { producto_id } = req.params;
      const promociones = await PromocionProducto.findAll({
        where: { producto_id },
        include: [{ model: Promocion, as: 'promocion' }]
      });
      return res.status(200).json({ success: true, data: promociones });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
