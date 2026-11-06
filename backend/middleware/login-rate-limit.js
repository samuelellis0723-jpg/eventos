'use strict';
const { sequelize, AdminLoginLimite } = require('../models');
const { sha256 } = require('./admin-auth');
const WINDOW_MS = 15 * 60 * 1000;

module.exports = async function loginRateLimit(req, res, next) {
  try {
    const email = typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase().slice(0, 150) : '';
    const buckets = [
      { clave: sha256('ip:' + req.ip), limit: 50 },
      { clave: sha256('account:' + req.ip + ':' + email), limit: 10 }
    ];
    const allowed = await sequelize.transaction(async (transaction) => {
      for (const bucket of buckets) {
        await AdminLoginLimite.findOrCreate({ where: { clave: bucket.clave }, defaults: { vence_en: new Date(Date.now() + WINDOW_MS) }, transaction });
        const row = await AdminLoginLimite.findByPk(bucket.clave, { transaction, lock: transaction.LOCK.UPDATE });
        if (new Date(row.vence_en) <= new Date()) await row.update({ intentos: 0, vence_en: new Date(Date.now() + WINDOW_MS) }, { transaction });
        if (row.intentos >= bucket.limit) return false;
        await row.increment('intentos', { transaction });
      }
      return true;
    });
    if (!allowed) {
      res.set('Retry-After', String(WINDOW_MS / 1000));
      return res.status(429).json({ success: false, message: 'Demasiados intentos de acceso. Intenta de nuevo en 15 minutos.' });
    }
    return next();
  } catch (error) { return next(error); }
};
