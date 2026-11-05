'use strict';
const { EventoMercadeo, ActivoCreativo, Empleado, EventoSesion, Contacto } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.estado) where.estado = req.query.estado;
      if (req.query.modalidad) where.modalidad = req.query.modalidad;
      if (req.query.destacado_en_inicio !== undefined) where.destacado_en_inicio = req.query.destacado_en_inicio === 'true';

      const { count, rows } = await EventoMercadeo.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: ActivoCreativo, as: 'imagen_portada', attributes: ['id', 'url_archivo'] },
          { model: Empleado, as: 'responsable', attributes: ['id', 'nombre', 'apellidos'] }
        ],
        order: [['fecha_inicio', 'ASC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const evento = await EventoMercadeo.findByPk(id, {
        include: [
          { model: ActivoCreativo, as: 'imagen_portada' },
          { model: Empleado, as: 'responsable', attributes: ['id', 'nombre', 'apellidos'] },
          { model: EventoSesion, as: 'sesiones' }
        ]
      });
      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento de mercadeo no encontrado' });
      }
      return res.status(200).json({ success: true, data: evento });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const evento = await EventoMercadeo.findOne({
        where: { slug },
        include: [
          { model: ActivoCreativo, as: 'imagen_portada' },
          { model: EventoSesion, as: 'sesiones' }
        ]
      });
      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado para el slug provisto' });
      }
      return res.status(200).json({ success: true, data: evento });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const {
        slug,
        nombre,
        resumen,
        descripcion,
        tipo,
        estado,
        estado_publicacion,
        modalidad,
        lugar,
        url_virtual,
        fecha_inicio,
        fecha_fin,
        inscripciones_desde,
        inscripciones_hasta,
        cupo_maximo,
        destacado_en_inicio,
        imagen_portada_id,
        responsable_id
      } = req.body;

      if (!slug || !nombre || !tipo || !modalidad || !fecha_inicio || !responsable_id) {
        return res.status(400).json({
          success: false,
          message: 'slug, nombre, tipo, modalidad, fecha_inicio y responsable_id son obligatorios'
        });
      }

      const nuevo = await EventoMercadeo.create({
        slug,
        nombre,
        resumen,
        descripcion,
        tipo,
        estado: estado || 'planificado',
        estado_publicacion: estado_publicacion || 'borrador',
        modalidad,
        lugar,
        url_virtual,
        fecha_inicio,
        fecha_fin,
        inscripciones_desde,
        inscripciones_hasta,
        cupo_maximo,
        destacado_en_inicio: destacado_en_inicio !== undefined ? destacado_en_inicio : false,
        imagen_portada_id,
        responsable_id
      });
      return res.status(201).json({ success: true, message: 'Evento de mercadeo creado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const evento = await EventoMercadeo.findByPk(id);
      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado' });
      }
      const {
        slug,
        nombre,
        resumen,
        descripcion,
        tipo,
        estado,
        estado_publicacion,
        modalidad,
        lugar,
        url_virtual,
        fecha_inicio,
        fecha_fin,
        inscripciones_desde,
        inscripciones_hasta,
        cupo_maximo,
        destacado_en_inicio,
        imagen_portada_id,
        responsable_id
      } = req.body;

      await evento.update({
        slug,
        nombre,
        resumen,
        descripcion,
        tipo,
        estado,
        estado_publicacion,
        modalidad,
        lugar,
        url_virtual,
        fecha_inicio,
        fecha_fin,
        inscripciones_desde,
        inscripciones_hasta,
        cupo_maximo,
        destacado_en_inicio,
        imagen_portada_id,
        responsable_id
      });
      return res.status(200).json({ success: true, message: 'Evento actualizado', data: evento });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const evento = await EventoMercadeo.findByPk(id);
      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado' });
      }
      await evento.destroy();
      return res.status(200).json({ success: true, message: 'Evento eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
