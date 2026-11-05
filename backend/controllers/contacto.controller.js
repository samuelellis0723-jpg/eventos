'use strict';
const { Contacto, CuentaCliente, Consentimiento, ProgramaLealtad } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.tipo_persona) where.tipo_persona = req.query.tipo_persona;
      if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

      const { count, rows } = await Contacto.findAndCountAll({
        where,
        limit,
        offset,
        order: [['id', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const contacto = await Contacto.findByPk(id, {
        include: [
          { model: CuentaCliente, as: 'cuenta_cliente' },
          { model: Consentimiento, as: 'consentimientos' },
          { model: ProgramaLealtad, as: 'programas', through: { attributes: ['puntos_saldo', 'nivel', 'fecha_union', 'activo'] } }
        ]
      });
      if (!contacto) {
        return res.status(404).json({ success: false, message: 'Contacto no encontrado' });
      }
      return res.status(200).json({ success: true, data: contacto });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const {
        tipo,
        tipo_persona,
        nombre,
        apellidos,
        razon_social,
        correo,
        telefono,
        provincia,
        canton,
        activo
      } = req.body;

      if (!nombre) {
        return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
      }

      const nuevoContacto = await Contacto.create({
        tipo: tipo || 'prospecto',
        tipo_persona: tipo_persona || 'fisica',
        nombre,
        apellidos,
        razon_social,
        correo,
        telefono,
        provincia,
        canton,
        activo: activo !== undefined ? activo : true
      });
      return res.status(201).json({ success: true, message: 'Contacto creado exitosamente', data: nuevoContacto });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const contacto = await Contacto.findByPk(id);
      if (!contacto) {
        return res.status(404).json({ success: false, message: 'Contacto no encontrado' });
      }
      const {
        tipo,
        tipo_persona,
        nombre,
        apellidos,
        razon_social,
        correo,
        telefono,
        provincia,
        canton,
        activo
      } = req.body;

      await contacto.update({
        tipo,
        tipo_persona,
        nombre,
        apellidos,
        razon_social,
        correo,
        telefono,
        provincia,
        canton,
        activo
      });
      return res.status(200).json({ success: true, message: 'Contacto actualizado exitosamente', data: contacto });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const contacto = await Contacto.findByPk(id);
      if (!contacto) {
        return res.status(404).json({ success: false, message: 'Contacto no encontrado' });
      }
      await contacto.destroy();
      return res.status(200).json({ success: true, message: 'Contacto eliminado exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
