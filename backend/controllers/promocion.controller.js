'use strict';
const { Promocion, ProductoSeguro, ActivoCreativo, Empleado, Cupon } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.estado) where.estado = req.query.estado;
      if (req.query.destacado_en_inicio !== undefined) where.destacado_en_inicio = req.query.destacado_en_inicio === 'true';

      const { count, rows } = await Promocion.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: ActivoCreativo, as: 'imagen', attributes: ['id', 'url_archivo'] },
          { model: ProductoSeguro, as: 'productos', through: { attributes: [] } }
        ],
        order: [['fecha_inicio', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const promocion = await Promocion.findByPk(id, {
        include: [
          { model: ActivoCreativo, as: 'imagen' },
          { model: Empleado, as: 'creador', attributes: ['id', 'nombre', 'apellidos'] },
          { model: Empleado, as: 'aprobador', attributes: ['id', 'nombre', 'apellidos'] },
          { model: ProductoSeguro, as: 'productos', through: { attributes: [] } },
          { model: Cupon, as: 'cupones' }
        ]
      });
      if (!promocion) {
        return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
      }
      return res.status(200).json({ success: true, data: promocion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const promocion = await Promocion.findOne({
        where: { slug },
        include: [
          { model: ActivoCreativo, as: 'imagen' },
          { model: ProductoSeguro, as: 'productos', through: { attributes: [] } }
        ]
      });
      if (!promocion) {
        return res.status(404).json({ success: false, message: 'Promoción no encontrada para el slug provisto' });
      }
      return res.status(200).json({ success: true, data: promocion });
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
        condiciones,
        tipo,
        descuento_pct,
        estado,
        fecha_inicio,
        fecha_fin,
        destacado_en_inicio,
        requiere_cupon,
        limite_canjeos,
        imagen_id,
        creado_por,
        aprobado_por
      } = req.body;

      if (!slug || !nombre || !tipo || !fecha_inicio || !fecha_fin || !creado_por) {
        return res.status(400).json({
          success: false,
          message: 'slug, nombre, tipo, fecha_inicio, fecha_fin y creado_por son obligatorios'
        });
      }

      const nueva = await Promocion.create({
        slug,
        nombre,
        resumen,
        descripcion,
        condiciones,
        tipo,
        descuento_pct,
        estado: estado || 'borrador',
        fecha_inicio,
        fecha_fin,
        destacado_en_inicio: destacado_en_inicio !== undefined ? destacado_en_inicio : false,
        requiere_cupon: requiere_cupon !== undefined ? requiere_cupon : false,
        limite_canjeos,
        imagen_id,
        creado_por,
        aprobado_por
      });
      return res.status(201).json({ success: true, message: 'Promoción creada', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const promocion = await Promocion.findByPk(id);
      if (!promocion) {
        return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
      }
      const {
        slug,
        nombre,
        resumen,
        descripcion,
        condiciones,
        tipo,
        descuento_pct,
        estado,
        fecha_inicio,
        fecha_fin,
        destacado_en_inicio,
        requiere_cupon,
        limite_canjeos,
        imagen_id,
        aprobado_por
      } = req.body;

      await promocion.update({
        slug,
        nombre,
        resumen,
        descripcion,
        condiciones,
        tipo,
        descuento_pct,
        estado,
        fecha_inicio,
        fecha_fin,
        destacado_en_inicio,
        requiere_cupon,
        limite_canjeos,
        imagen_id,
        aprobado_por
      });
      return res.status(200).json({ success: true, message: 'Promoción actualizada', data: promocion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const promocion = await Promocion.findByPk(id);
      if (!promocion) {
        return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
      }
      await promocion.destroy();
      return res.status(200).json({ success: true, message: 'Promoción eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
