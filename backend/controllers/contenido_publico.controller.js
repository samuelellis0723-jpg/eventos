'use strict';
const { ContenidoPublico, ActivoCreativo, Empleado, CategoriaContenido } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.estado) where.estado = req.query.estado;
      if (req.query.visible_en_inicio !== undefined) where.visible_en_inicio = req.query.visible_en_inicio === 'true';

      const { count, rows } = await ContenidoPublico.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: ActivoCreativo, as: 'imagen_portada', attributes: ['id', 'nombre', 'url_archivo'] },
          { model: CategoriaContenido, as: 'categorias', through: { attributes: [] } }
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
      const contenido = await ContenidoPublico.findByPk(id, {
        include: [
          { model: ActivoCreativo, as: 'imagen_portada' },
          { model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] },
          { model: Empleado, as: 'aprobador', attributes: ['id', 'nombre', 'apellidos'] },
          { model: CategoriaContenido, as: 'categorias', through: { attributes: [] } }
        ]
      });
      if (!contenido) {
        return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
      }
      return res.status(200).json({ success: true, data: contenido });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const contenido = await ContenidoPublico.findOne({
        where: { slug },
        include: [
          { model: ActivoCreativo, as: 'imagen_portada' },
          { model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] },
          { model: CategoriaContenido, as: 'categorias', through: { attributes: [] } }
        ]
      });
      if (!contenido) {
        return res.status(404).json({ success: false, message: 'Contenido no encontrado para el slug especificado' });
      }
      return res.status(200).json({ success: true, data: contenido });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const {
        tipo,
        slug,
        titulo,
        resumen,
        cuerpo,
        imagen_portada_id,
        estado,
        visible_en_inicio,
        orden_inicio,
        programado_para,
        publicado_en,
        publicado_hasta,
        creado_por,
        aprobado_por
      } = req.body;

      if (!tipo || !slug || !titulo || !cuerpo || !creado_por) {
        return res.status(400).json({
          success: false,
          message: 'tipo, slug, titulo, cuerpo y creado_por son obligatorios'
        });
      }

      const nuevo = await ContenidoPublico.create({
        tipo,
        slug,
        titulo,
        resumen,
        cuerpo,
        imagen_portada_id,
        estado: estado || 'borrador',
        visible_en_inicio: visible_en_inicio !== undefined ? visible_en_inicio : false,
        orden_inicio,
        programado_para,
        publicado_en,
        publicado_hasta,
        creado_por,
        aprobado_por
      });
      return res.status(201).json({ success: true, message: 'Contenido público creado', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const contenido = await ContenidoPublico.findByPk(id);
      if (!contenido) {
        return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
      }
      const {
        tipo,
        slug,
        titulo,
        resumen,
        cuerpo,
        imagen_portada_id,
        estado,
        visible_en_inicio,
        orden_inicio,
        programado_para,
        publicado_en,
        publicado_hasta,
        aprobado_por
      } = req.body;

      await contenido.update({
        tipo,
        slug,
        titulo,
        resumen,
        cuerpo,
        imagen_portada_id,
        estado,
        visible_en_inicio,
        orden_inicio,
        programado_para,
        publicado_en,
        publicado_hasta,
        aprobado_por,
        actualizado_en: new Date()
      });
      return res.status(200).json({ success: true, message: 'Contenido público actualizado', data: contenido });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const contenido = await ContenidoPublico.findByPk(id);
      if (!contenido) {
        return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
      }
      await contenido.destroy();
      return res.status(200).json({ success: true, message: 'Contenido público eliminado' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
