'use strict';
const { MovimientoPuntos, ContactoPrograma, Empleado, sequelize } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.contacto_programa_id) where.contacto_programa_id = req.query.contacto_programa_id;
      if (req.query.tipo) where.tipo = req.query.tipo;

      const { count, rows } = await MovimientoPuntos.findAndCountAll({
        where,
        limit,
        offset,
        order: [['registrado_en', 'DESC']]
      });
      return res.status(200).json(formatPaginatedResponse(count, rows, page, limit));
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const movimiento = await MovimientoPuntos.findByPk(id, {
        include: [
          { model: ContactoPrograma, as: 'contacto_programa' },
          { model: Empleado, as: 'registrador', attributes: ['id', 'nombre', 'apellidos'] }
        ]
      });
      if (!movimiento) {
        return res.status(404).json({ success: false, message: 'Movimiento de puntos no encontrado' });
      }
      return res.status(200).json({ success: true, data: movimiento });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async registrar(req, res) {
    const t = await sequelize.transaction();
    try {
      const { contacto_programa_id, tipo, puntos_delta, descripcion, referencia, registrado_por } = req.body;
      if (!contacto_programa_id || !tipo || puntos_delta === undefined) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'contacto_programa_id, tipo y puntos_delta son obligatorios'
        });
      }

      const membresia = await ContactoPrograma.findByPk(contacto_programa_id, { transaction: t });
      if (!membresia) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'La cuenta de programa de lealtad no existe' });
      }

      // Validar que no quede en saldo negativo si es canje o resta
      const nuevoSaldo = membresia.puntos_saldo + parseInt(puntos_delta, 10);
      if (nuevoSaldo < 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Saldo insuficiente. Saldo actual: ${membresia.puntos_saldo}, intento de cambio: ${puntos_delta}`
        });
      }

      const movimiento = await MovimientoPuntos.create({
        contacto_programa_id,
        tipo,
        puntos_delta,
        descripcion,
        referencia,
        registrado_por
      }, { transaction: t });

      // Actualizar el saldo de consulta en contacto_programa
      await membresia.update({ puntos_saldo: nuevoSaldo }, { transaction: t });

      await t.commit();
      return res.status(201).json({
        success: true,
        message: 'Movimiento de puntos registrado y saldo actualizado',
        data: movimiento,
        nuevo_saldo: nuevoSaldo
      });
    } catch (err) {
      await t.rollback();
      return handleSequelizeError(err, res);
    }
  }
};
