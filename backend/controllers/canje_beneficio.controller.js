'use strict';
const { CanjeBeneficio, ContactoPrograma, BeneficioLealtad, Empleado, sequelize } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.contacto_programa_id) where.contacto_programa_id = req.query.contacto_programa_id;
      if (req.query.estado) where.estado = req.query.estado;

      const { count, rows } = await CanjeBeneficio.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          { model: BeneficioLealtad, as: 'beneficio', attributes: ['id', 'nombre', 'puntos_requeridos'] },
          { model: ContactoPrograma, as: 'contacto_programa' }
        ],
        order: [['solicitado_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const canje = await CanjeBeneficio.findByPk(id, {
        include: [
          { model: BeneficioLealtad, as: 'beneficio' },
          { model: ContactoPrograma, as: 'contacto_programa' },
          { model: Empleado, as: 'procesador', attributes: ['id', 'nombre', 'apellidos'] }
        ]
      });
      if (!canje) {
        return res.status(404).json({ success: false, message: 'Solicitud de canje no encontrada' });
      }
      return res.status(200).json({ success: true, data: canje });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async solicitar(req, res) {
    try {
      const { contacto_programa_id, beneficio_id, puntos_utilizados, notas } = req.body;
      if (!contacto_programa_id || !beneficio_id || puntos_utilizados === undefined) {
        return res.status(400).json({
          success: false,
          message: 'contacto_programa_id, beneficio_id y puntos_utilizados son obligatorios'
        });
      }
      const nuevo = await CanjeBeneficio.create({
        contacto_programa_id,
        beneficio_id,
        estado: 'solicitado',
        puntos_utilizados,
        notas
      });
      return res.status(201).json({ success: true, message: 'Solicitud de canje creada exitosamente', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const canje = await CanjeBeneficio.findByPk(id);
      if (!canje) {
        return res.status(404).json({ success: false, message: 'Solicitud de canje no encontrada' });
      }
      const { estado, procesado_por, notas } = req.body;
      if (!estado) {
        return res.status(400).json({ success: false, message: 'El campo estado es obligatorio' });
      }

      await canje.update({
        estado,
        procesado_en: new Date(),
        procesado_por: procesado_por || canje.procesado_por,
        notas: notas !== undefined ? notas : canje.notas
      });
      return res.status(200).json({ success: true, message: 'Estado del canje actualizado', data: canje });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
