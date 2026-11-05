'use strict';
const { CalendarioContenido, ContenidoPublico, Empleado } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.contenido_id) where.contenido_id = req.query.contenido_id;
      if (req.query.canal) where.canal = req.query.canal;
      if (req.query.estado) where.estado = req.query.estado;

      const { count, rows } = await CalendarioContenido.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: ContenidoPublico, as: 'contenido', attributes: ['id', 'titulo', 'slug'] },
          { model: Empleado, as: 'responsable', attributes: ['id', 'nombre', 'apellidos'] }
        ],
        order: [['fecha_programada', 'ASC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await CalendarioContenido.findByPk(id, {
        include: [
          { model: ContenidoPublico, as: 'contenido' },
          { model: Empleado, as: 'responsable' }
        ]
      });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Entrada de calendario no encontrada' });
      }
      return res.status(200).json({ success: true, data: item });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { contenido_id, canal, fecha_programada, estado, url_publicacion, responsable_id, publicado_en } = req.body;
      if (!contenido_id || !canal || !fecha_programada) {
        return res.status(400).json({
          success: false,
          message: 'contenido_id, canal y fecha_programada son obligatorios'
        });
      }
      const nuevo = await CalendarioContenido.create({
        contenido_id,
        canal,
        fecha_programada,
        estado: estado || 'programado',
        url_publicacion,
        responsable_id,
        publicado_en
      });
      return res.status(201).json({ success: true, message: 'Publicación programada en calendario', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const item = await CalendarioContenido.findByPk(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Entrada de calendario no encontrada' });
      }
      const { canal, fecha_programada, estado, url_publicacion, responsable_id, publicado_en } = req.body;
      await item.update({ canal, fecha_programada, estado, url_publicacion, responsable_id, publicado_en });
      return res.status(200).json({ success: true, message: 'Calendario actualizado', data: item });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const item = await CalendarioContenido.findByPk(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Entrada de calendario no encontrada' });
      }
      await item.destroy();
      return res.status(200).json({ success: true, message: 'Entrada de calendario eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
