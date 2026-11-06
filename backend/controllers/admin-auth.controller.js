'use strict';

const { randomBytes } = require('crypto');
const { Op } = require('sequelize');
const { UsuarioAdmin, Empleado, RolAdmin, SesionAdmin } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/password-hash');
const {
  SESSION_COOKIE,
  CSRF_COOKIE,
  SESSION_TTL_MS,
  sha256,
  readCookie,
  cookieOptions,
  csrfCookieOptions,
  clearAuthCookies
} = require('../middleware/admin-auth');

const PRE_AUTH_CSRF_TTL_MS = 15 * 60 * 1000;

function buildSessionUser(user) {
  return {
    id: user.id,
    nombre: user.empleado?.nombre || '',
    apellidos: user.empleado?.apellidos || '',
    correo: user.empleado?.correo || '',
    roles: (user.roles || []).map((role) => ({ codigo: role.codigo, nombre: role.nombre }))
  };
}

function setCsrfCookie(res, token, maxAge) {
  res.cookie(CSRF_COOKIE, token, csrfCookieOptions(maxAge));
}

module.exports = {
  async issueCsrf(req, res) {
    try {
      const rawSessionToken = readCookie(req, SESSION_COOKIE);
      if (rawSessionToken) {
        const session = await SesionAdmin.findOne({
          where: {
            token_hash: sha256(rawSessionToken),
            expira_en: { [Op.gt]: new Date() }
          }
        });
        if (session) {
          const remainingTtl = Math.max(0, new Date(session.expira_en).getTime() - Date.now());
          const csrfToken = randomBytes(32).toString('base64url');
          await session.update({ csrf_hash: sha256(csrfToken) });
          setCsrfCookie(res, csrfToken, remainingTtl);
          return res.status(200).json({ success: true, data: { csrfToken } });
        }
      }

      const csrfToken = randomBytes(32).toString('base64url');
      setCsrfCookie(res, csrfToken, PRE_AUTH_CSRF_TTL_MS);
      return res.status(200).json({ success: true, data: { csrfToken } });
    } catch (error) {
      console.error('No se pudo emitir el token CSRF:', error.name);
      return res.status(500).json({ success: false, message: 'No se pudo iniciar la protección de la sesión.' });
    }
  },

  async login(req, res) {
    const email = typeof req.body?.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';
    const password = typeof req.body?.contrasena === 'string' ? req.body.contrasena : '';
    if (!email || email.length > 150 || !password || password.length > 128) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });
    }

    try {
      const user = await UsuarioAdmin.unscoped().findOne({
        where: { proveedor_auth: 'local', subject_auth: email },
        attributes: ['id', 'empleado_id', 'activo', 'password_hash'],
        include: [
          {
            model: Empleado,
            as: 'empleado',
            required: false,
            attributes: ['id', 'nombre', 'apellidos', 'correo', 'activo']
          },
          {
            model: RolAdmin,
            as: 'roles',
            attributes: ['codigo', 'nombre'],
            through: { attributes: [] }
          }
        ]
      });

      const passwordMatches = await verifyPassword(password, user?.password_hash);
      if (!user || !passwordMatches || !user.activo || !user.empleado?.activo) {
        return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });
      }

      const rawSessionToken = randomBytes(32).toString('base64url');
      const csrfToken = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      await user.update({ ultimo_acceso: new Date() });
      await SesionAdmin.create({
        usuario_admin_id: user.id,
        token_hash: sha256(rawSessionToken),
        csrf_hash: sha256(csrfToken),
        expira_en: expiresAt
      });

      res.cookie(SESSION_COOKIE, rawSessionToken, cookieOptions(SESSION_TTL_MS));
      setCsrfCookie(res, csrfToken, SESSION_TTL_MS);
      return res.status(200).json({
        success: true,
        data: {
          usuario: buildSessionUser(user),
          csrfToken,
          expiraEn: expiresAt.toISOString()
        }
      });
    } catch (error) {
      console.error('No se pudo iniciar sesión administrativa:', error.name);
      return res.status(500).json({ success: false, message: 'No se pudo iniciar sesión.' });
    }
  },

  getSession(req, res) {
    const csrfCookie = readCookie(req, CSRF_COOKIE);
    const csrfToken = csrfCookie && sha256(csrfCookie) === req.adminSession.csrf_hash
      ? csrfCookie
      : null;
    return res.status(200).json({
      success: true,
      data: {
        usuario: buildSessionUser(req.adminUser),
        csrfToken,
        expiraEn: new Date(req.adminSession.expira_en).toISOString()
      }
    });
  },

  async logout(req, res) {
    try {
      await req.adminSession.destroy();
      clearAuthCookies(res);
      return res.status(200).json({ success: true, message: 'Sesión cerrada.' });
    } catch (error) {
      console.error('No se pudo cerrar sesión administrativa:', error.name);
      return res.status(500).json({ success: false, message: 'No se pudo cerrar la sesión.' });
    }
  }
};
