'use strict';
const { Router } = require('express');

const router = Router();

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

