'use strict';
const { Router } = require('express');
const {
  contactoController,
  cuentaClienteController,
  consentimientoController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());

// Contactos
router.get('/contactos', contactoController.getAll);
router.post('/contactos', contactoController.create);
router.get('/contactos/:id', contactoController.getById);
router.put('/contactos/:id', contactoController.update);
router.delete('/contactos/:id', contactoController.delete);
router.get('/contactos/:contacto_id/cuenta-cliente', cuentaClienteController.getByContacto);
router.get('/contactos/:contacto_id/consentimientos', consentimientoController.getByContacto);

// Cuentas de cliente
router.get('/cuentas-cliente', cuentaClienteController.getAll);
router.post('/cuentas-cliente', cuentaClienteController.create);
router.get('/cuentas-cliente/:id', cuentaClienteController.getById);
router.put('/cuentas-cliente/:id', cuentaClienteController.update);
router.delete('/cuentas-cliente/:id', cuentaClienteController.delete);

// Consentimientos (historial: sin actualización ni eliminación)
router.get('/consentimientos', consentimientoController.getAll);
router.post('/consentimientos', consentimientoController.create);
router.get('/consentimientos/:id', consentimientoController.getById);

module.exports = router;

