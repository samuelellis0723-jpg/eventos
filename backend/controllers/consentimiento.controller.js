'use strict';
const { Consentimiento, Contacto } = require('../models');
const { handleSequelizeError, getPagination, formatPaginatedResponse } = require('./helpers');

module.exports = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPagination(req);
      const where = {};
      if (req.query.contacto_id) where.contacto_id = req.query.contacto_id;
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.otorgado !== undefined) where.otorgado = req.query.otorgado === 'true';

      const { count, rows } = await Consentimiento.findAndCountAll({
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
      const consentimiento = await Consentimiento.findByPk(id, {
        include: [{ model: Contacto, as: 'contacto' }]
      });
      if (!consentimiento) {
        return res.status(404).json({ success: false, message: 'Consentimiento no encontrado' });
      }
      return res.status(200).json({ success: true, data: consentimiento });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async getByContacto(req, res) {
    try {
      const { contacto_id } = req.params;
      const consentimientos = await Consentimiento.findAll({
        where: { contacto_id },
        order: [['registrado_en', 'DESC']]
      });
      return res.status(200).json({ success: true, data: consentimientos });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  },

  async create(req, res) {
    try {
      const { contacto_id, tipo, otorgado, medio_captura, version_texto, ip_origen } = req.body;
      if (!contacto_id || !tipo || otorgado === undefined) {
        return res.status(400).json({
          success: false,
          message: 'contacto_id, tipo y otorgado son obligatorios'
        });
      }
      const nuevo = await Consentimiento.create({
        contacto_id,
        tipo,
        otorgado,
        medio_captura,
        version_texto,
        ip_origen: ip_origen || req.ip
      });
      return res.status(201).json({ success: true, message: 'Consentimiento registrado exitosamente', data: nuevo });
    } catch (err) {
      return handleSequelizeError(err, res);
    }
  }
};
