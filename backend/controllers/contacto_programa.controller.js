'use strict';
const { ContactoPrograma, Contacto, ProgramaLealtad, MovimientoPuntos, CanjeBeneficio } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.contacto_id) where.contacto_id = req.query.contacto_id;
      if (req.query.programa_id) where.programa_id = req.query.programa_id;
      if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

      const { count, rows } = await ContactoPrograma.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: Contacto, as: 'contacto', attributes: ['id', 'nombre', 'correo'] },
          { model: ProgramaLealtad, as: 'programa', attributes: ['id', 'nombre', 'codigo'] }
        ],
        order: [['fecha_union', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const membresia = await ContactoPrograma.findByPk(id, {
        include: [
          { model: Contacto, as: 'contacto' },
          { model: ProgramaLealtad, as: 'programa' },
          { model: MovimientoPuntos, as: 'movimientos_puntos' },
          { model: CanjeBeneficio, as: 'canjes_beneficio' }
        ]
      });
      if (!membresia) {
        return res.status(404).json({ success: false, message: 'Registro de contacto en programa no encontrado' });
      }
      return res.status(200).json({ success: true, data: membresia });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async inscribir(req, res) {
    try {
      const { contacto_id, programa_id, puntos_saldo, nivel, fecha_union, activo } = req.body;
      if (!contacto_id || !programa_id || !fecha_union) {
        return res.status(400).json({
          success: false,
          message: 'contacto_id, programa_id y fecha_union son obligatorios'
        });
      }
      const nueva = await ContactoPrograma.create({
        contacto_id,
        programa_id,
        puntos_saldo: puntos_saldo || 0,
        nivel,
        fecha_union,
        activo: activo !== undefined ? activo : true
      });
      return res.status(201).json({ success: true, message: 'Contacto inscrito al programa de lealtad', data: nueva });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const membresia = await ContactoPrograma.findByPk(id);
      if (!membresia) {
        return res.status(404).json({ success: false, message: 'Registro no encontrado' });
      }
      const { puntos_saldo, nivel, activo } = req.body;
      await membresia.update({ puntos_saldo, nivel, activo });
      return res.status(200).json({ success: true, message: 'Membresía actualizada', data: membresia });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
