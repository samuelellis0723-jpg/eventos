'use strict';
const { ContenidoCategoria, ContenidoPublico, CategoriaContenido } = require('../models');
const { handleSequelizeError } = require('./helpers');

module.exports = {
  async asociar(req, res) {
    try {
      const { contenido_id, categoria_id } = req.body;
      if (!contenido_id || !categoria_id) {
        return res.status(400).json({ success: false, message: 'contenido_id y categoria_id son obligatorios' });
      }
      const nueva = await ContenidoCategoria.create({ contenido_id, categoria_id });
      return res.status(201).json({ success: true, message: 'Categoría asociada a contenido', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async desasociar(req, res) {
    try {
      const { contenido_id, categoria_id } = req.body;
      if (!contenido_id || !categoria_id) {
        return res.status(400).json({ success: false, message: 'contenido_id y categoria_id son obligatorios' });
      }
      const deleted = await ContenidoCategoria.destroy({ where: { contenido_id, categoria_id } });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Asociación no encontrada' });
      }
      return res.status(200).json({ success: true, message: 'Categoría desasociada exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getCategoriasPorContenido(req, res) {
    try {
      const { contenido_id } = req.params;
      const categorias = await ContenidoCategoria.findAll({
        where: { contenido_id },
        include: [{ model: CategoriaContenido, as: 'categoria' }]
      });
      return res.status(200).json({ success: true, data: categorias });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getContenidosPorCategoria(req, res) {
    try {
      const { categoria_id } = req.params;
      const contenidos = await ContenidoCategoria.findAll({
        where: { categoria_id },
        include: [{ model: ContenidoPublico, as: 'contenido' }]
      });
      return res.status(200).json({ success: true, data: contenidos });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
