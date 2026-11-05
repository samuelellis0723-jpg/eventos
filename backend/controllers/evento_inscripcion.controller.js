'use strict';
const { EventoInscripcion, EventoMercadeo, Contacto } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async inscribir(req, res) {
    try {
      const { evento_id, contacto_id, estado, notas } = req.body;
      if (!evento_id || !contacto_id) {
        return res.status(400).json({ success: false, message: 'evento_id y contacto_id son obligatorios' });
      }
      const inscripcion = await EventoInscripcion.create({
        evento_id,
        contacto_id,
        estado: estado || 'inscrito',
        notas
      });
      return res.status(201).json({ success: true, message: 'Inscripción registrada con éxito', data: inscripcion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async actualizarEstado(req, res) {
    try {
      const { evento_id, contacto_id } = req.params;
      const inscripcion = await EventoInscripcion.findOne({
        where: { evento_id, contacto_id }
      });
      if (!inscripcion) {
        return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
      }
      const { estado, confirmado_en, check_in_en, notas } = req.body;
      await inscripcion.update({
        estado,
        confirmado_en,
        check_in_en,
        notas
      });
      return res.status(200).json({ success: true, message: 'Inscripción actualizada', data: inscripcion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async cancelarInscripcion(req, res) {
    try {
      const { evento_id, contacto_id } = req.params;
      const inscripcion = await EventoInscripcion.findOne({
        where: { evento_id, contacto_id }
      });
      if (!inscripcion) {
        return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
      }
      await inscripcion.update({ estado: 'cancelado' });
      return res.status(200).json({ success: true, message: 'Inscripción cancelada exitosamente' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getInscripcionesPorEvento(req, res) {
    try {
      const { evento_id } = req.params;
      const { page, limit, offset } = getPagination(req);
      const where = { evento_id };
      if (req.query.estado) where.estado = req.query.estado;

      const { count, rows } = await EventoInscripcion.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Contacto, as: 'contacto', attributes: ['id', 'nombre', 'apellidos', 'correo', 'telefono'] }],
        order: [['registrado_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getInscripcionesPorContacto(req, res) {
    try {
      const { contacto_id } = req.params;
      const inscripciones = await EventoInscripcion.findAll({
        where: { contacto_id },
        include: [{ model: EventoMercadeo, as: 'evento', attributes: ['id', 'nombre', 'slug', 'fecha_inicio'] }]
      });
      return res.status(200).json({ success: true, data: inscripciones });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
