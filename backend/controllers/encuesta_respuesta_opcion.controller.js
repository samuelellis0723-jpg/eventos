'use strict';
const { EncuestaRespuestaOpcion, EncuestaRespuesta, EncuestaOpcion } = require('../models');
const { handleSequelizeError } = require('./helpers');

module.exports = {
  async asociar(req, res) {
    try {
      const { respuesta_id, opcion_id } = req.body;
      if (!respuesta_id || !opcion_id) {
        return res.status(400).json({ success: false, message: 'respuesta_id y opcion_id son obligatorios' });
      }
      const nueva = await EncuestaRespuestaOpcion.create({ respuesta_id, opcion_id });
      return res.status(201).json({ success: true, message: 'Opción vinculada a la respuesta', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async desasociar(req, res) {
    try {
      const { respuesta_id, opcion_id } = req.body;
      if (!respuesta_id || !opcion_id) {
        return res.status(400).json({ success: false, message: 'respuesta_id y opcion_id son obligatorios' });
      }
      const deleted = await EncuestaRespuestaOpcion.destroy({ where: { respuesta_id, opcion_id } });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Vínculo opción-respuesta no encontrado' });
      }
      return res.status(200).json({ success: true, message: 'Opción desasociada de la respuesta' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getOpcionesPorRespuesta(req, res) {
    try {
      const { respuesta_id } = req.params;
      const opciones = await EncuestaRespuestaOpcion.findAll({
        where: { respuesta_id },
        include: [{ model: EncuestaOpcion, as: 'opcion' }]
      });
      return res.status(200).json({ success: true, data: opciones });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
