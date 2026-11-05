'use strict';
const { EventoSesionExpositor, EventoSesion, Expositor } = require('../models');
const { handleSequelizeError } = require('./helpers');

module.exports = {
  async asignarExpositor(req, res) {
    try {
      const { sesion_id, expositor_id } = req.body;
      if (!sesion_id || !expositor_id) {
        return res.status(400).json({ success: false, message: 'sesion_id y expositor_id son obligatorios' });
      }
      const asignacion = await EventoSesionExpositor.create({ sesion_id, expositor_id });
      return res.status(201).json({ success: true, message: 'Expositor asignado a la sesión', data: asignacion });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async removerExpositor(req, res) {
    try {
      const { sesion_id, expositor_id } = req.body;
      if (!sesion_id || !expositor_id) {
        return res.status(400).json({ success: false, message: 'sesion_id y expositor_id son obligatorios' });
      }
      const deleted = await EventoSesionExpositor.destroy({ where: { sesion_id, expositor_id } });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Asignación no encontrada' });
      }
      return res.status(200).json({ success: true, message: 'Expositor removido de la sesión' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getExpositoresPorSesion(req, res) {
    try {
      const { sesion_id } = req.params;
      const expositores = await EventoSesionExpositor.findAll({
        where: { sesion_id },
        include: [{ model: Expositor, as: 'expositor' }]
      });
      return res.status(200).json({ success: true, data: expositores });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getSesionesPorExpositor(req, res) {
    try {
      const { expositor_id } = req.params;
      const sesiones = await EventoSesionExpositor.findAll({
        where: { expositor_id },
        include: [{ model: EventoSesion, as: 'sesion' }]
      });
      return res.status(200).json({ success: true, data: sesiones });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
