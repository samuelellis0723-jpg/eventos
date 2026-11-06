'use strict';
const { Router } = require('express');
const {
  authenticateAdmin,
  requireRole,
  protectMutatingRequests
} = require('../middleware/admin-auth');

const router = Router();

// Lecturas públicas de la web, separadas de las rutas internas de gestión.
router.use('/public', require('./public.routes'));
router.use('/auth', require('./admin-auth.routes'));

// El resto de los módulos son internos y requieren una cuenta activa con rol admin.
// Las operaciones que cambian datos además validan origen y token CSRF.
router.use(authenticateAdmin, requireRole('admin'), protectMutatingRequests);

// Módulos organizados según los TableGroup del DBML
router.use(require('./acceso_admin.routes'));
router.use(require('./contactos.routes'));
router.use(require('./catalogo.routes'));
router.use(require('./contenido.routes'));
router.use(require('./eventos.routes'));
router.use(require('./encuestas.routes'));
router.use(require('./promociones.routes'));
router.use(require('./lealtad.routes'));

module.exports = router;

