'use strict';

const { createHash, timingSafeEqual } = require('crypto');
const { SesionAdmin, UsuarioAdmin, Empleado, RolAdmin } = require('../models');

const SESSION_COOKIE = 'eventos_admin_session';
const CSRF_COOKIE = 'eventos_admin_csrf';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  for (const entry of cookieHeader.split(';')) {
    const separator = entry.indexOf('=');
    if (separator < 0 || entry.slice(0, separator).trim() !== name) continue;
    const value = entry.slice(separator + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return '';
    }
  }
  return '';
}

function safeEqualText(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
    maxAge
  };
}

function csrfCookieOptions(maxAge) {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
    maxAge
  };
}

function clearAuthCookies(res) {
  const sessionOptions = cookieOptions(0);
  const csrfOptions = csrfCookieOptions(0);
  delete sessionOptions.maxAge;
  delete csrfOptions.maxAge;
  res.clearCookie(SESSION_COOKIE, sessionOptions);
  res.clearCookie(CSRF_COOKIE, csrfOptions);
}

function getAllowedOrigins() {
  const configuredOrigins = process.env.ADMIN_ALLOWED_ORIGINS;
  if (configuredOrigins) {
    return configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === 'production') return [];
  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
}

function requireAllowedOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin || !getAllowedOrigins().includes(origin)) {
    return res.status(403).json({ success: false, message: 'Origen no permitido.' });
  }
  return next();
}

function requirePreAuthCsrf(req, res, next) {
  const cookieToken = readCookie(req, CSRF_COOKIE);
  const headerToken = req.get('x-csrf-token');
  if (!cookieToken || !safeEqualText(cookieToken, headerToken)) {
    return res.status(403).json({ success: false, message: 'Token CSRF inválido o ausente.' });
  }
  return next();
}

async function authenticateAdmin(req, res, next) {
  try {
    const rawToken = readCookie(req, SESSION_COOKIE);
    if (!rawToken) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Se requiere una sesión administrativa.' });
    }

    const session = await SesionAdmin.findOne({
      where: { token_hash: sha256(rawToken) },
      include: [{
        model: UsuarioAdmin,
        as: 'usuario_admin',
        required: true,
        where: { activo: true },
        attributes: ['id', 'empleado_id', 'activo', 'ultimo_acceso'],
        include: [
          {
            model: Empleado,
            as: 'empleado',
            required: true,
            where: { activo: true },
            attributes: ['id', 'nombre', 'apellidos', 'correo']
          },
          {
            model: RolAdmin,
            as: 'roles',
            attributes: ['codigo', 'nombre'],
            through: { attributes: [] }
          }
        ]
      }]
    });

    if (!session || new Date(session.expira_en).getTime() <= Date.now()) {
      if (session) await session.destroy();
      else await SesionAdmin.destroy({ where: { token_hash: sha256(rawToken) } });
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'La sesión administrativa no es válida.' });
    }

    req.adminSession = session;
    req.adminUser = session.usuario_admin;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireRole(roleCode) {
  return (req, res, next) => {
    const roles = req.adminUser?.roles || [];
    if (!roles.some((role) => role.codigo === roleCode)) {
      return res.status(403).json({ success: false, message: 'No tienes el rol requerido.' });
    }
    return next();
  };
}

function protectMutatingRequests(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  const csrfCookie = readCookie(req, CSRF_COOKIE);
  const csrfHeader = req.get('x-csrf-token');
  const expectedHash = req.adminSession?.csrf_hash;
  if (!origin || !getAllowedOrigins().includes(origin)
    || !csrfCookie || !safeEqualText(csrfCookie, csrfHeader)
    || !expectedHash || !safeEqualText(sha256(csrfCookie), expectedHash)) {
    return res.status(403).json({ success: false, message: 'La solicitud no superó la validación CSRF.' });
  }
  return next();
}

module.exports = {
  SESSION_COOKIE,
  CSRF_COOKIE,
  SESSION_TTL_MS,
  sha256,
  readCookie,
  cookieOptions,
  csrfCookieOptions,
  clearAuthCookies,
  authenticateAdmin,
  requireRole,
  requireAllowedOrigin,
  requirePreAuthCsrf,
  protectMutatingRequests
};
