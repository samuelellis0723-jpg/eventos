'use strict';
const { CuentaCliente, Contacto } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.activa !== undefined) where.activa = req.query.activa === 'true';

      const { count, rows } = await CuentaCliente.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Contacto, as: 'contacto' }],
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
      const cuenta = await CuentaCliente.findByPk(id, {
        include: [{ model: Contacto, as: 'contacto' }]
      });
      if (!cuenta) {
        return res.status(404).json({ success: false, message: 'Cuenta de cliente no encontrada' });
      }
      return res.status(200).json({ success: true, data: cuenta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getByContacto(req, res) {
    try {
      const { contacto_id } = req.params;
      const cuenta = await CuentaCliente.findOne({
        where: { contacto_id },
        include: [{ model: Contacto, as: 'contacto' }]
      });
      if (!cuenta) {
        return res.status(404).json({ success: false, message: 'No existe cuenta para este contacto' });
      }
      return res.status(200).json({ success: true, data: cuenta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { contacto_id, proveedor_auth, subject_auth, activa } = req.body;
      if (!contacto_id || !proveedor_auth || !subject_auth) {
        return res.status(400).json({
          success: false,
          message: 'contacto_id, proveedor_auth y subject_auth son obligatorios'
        });
      }
      const nuevaCuenta = await CuentaCliente.create({
        contacto_id,
        proveedor_auth,
        subject_auth,
        activa: activa !== undefined ? activa : true
      });
      return res.status(201).json({ success: true, message: 'Cuenta de cliente creada', data: nuevaCuenta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const cuenta = await CuentaCliente.findByPk(id);
      if (!cuenta) {
        return res.status(404).json({ success: false, message: 'Cuenta de cliente no encontrada' });
      }
      const { proveedor_auth, subject_auth, activa } = req.body;
      await cuenta.update({ proveedor_auth, subject_auth, activa });
      return res.status(200).json({ success: true, message: 'Cuenta de cliente actualizada', data: cuenta });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const cuenta = await CuentaCliente.findByPk(id);
      if (!cuenta) {
        return res.status(404).json({ success: false, message: 'Cuenta de cliente no encontrada' });
      }
      await cuenta.destroy();
      return res.status(200).json({ success: true, message: 'Cuenta de cliente eliminada' });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
