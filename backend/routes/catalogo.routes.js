'use strict';
const { Router } = require('express');
const {
  ramoSeguroController,
  productoSeguroController,
  activoCreativoController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());

// Ramos de seguro
router.get('/ramos-seguro', ramoSeguroController.getAll);
router.post('/ramos-seguro', ramoSeguroController.create);
router.get('/ramos-seguro/:id', ramoSeguroController.getById);
router.put('/ramos-seguro/:id', ramoSeguroController.update);
router.delete('/ramos-seguro/:id', ramoSeguroController.delete);

// Productos de seguro
router.get('/productos-seguro', productoSeguroController.getAll);
router.post('/productos-seguro', productoSeguroController.create);
router.get('/productos-seguro/:id', productoSeguroController.getById);
router.put('/productos-seguro/:id', productoSeguroController.update);
router.delete('/productos-seguro/:id', productoSeguroController.delete);

// Activos creativos
router.get('/activos-creativos', activoCreativoController.getAll);
router.post('/activos-creativos', activoCreativoController.create);
router.get('/activos-creativos/:id', activoCreativoController.getById);
router.put('/activos-creativos/:id', activoCreativoController.update);
router.delete('/activos-creativos/:id', activoCreativoController.delete);

module.exports = router;

