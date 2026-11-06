'use strict';
const { Router } = require('express');
const {
  programaLealtadController,
  beneficioLealtadController,
  contactoProgramaController,
  movimientoPuntosController,
  canjeBeneficioController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());
const loyaltyEditor = require('../controllers/admin-content.controller').lealtad;

// Programas de lealtad
router.get('/programas-lealtad', programaLealtadController.getAll);
router.post('/programas-lealtad', loyaltyEditor.save);
router.get('/programas-lealtad/:id', programaLealtadController.getById);
router.put('/programas-lealtad/:id', loyaltyEditor.save);
router.delete('/programas-lealtad/:id', programaLealtadController.delete);

// Beneficios
router.get('/beneficios-lealtad', beneficioLealtadController.getAll);
router.post('/beneficios-lealtad', beneficioLealtadController.create);
router.get('/beneficios-lealtad/:id', beneficioLealtadController.getById);
router.put('/beneficios-lealtad/:id', beneficioLealtadController.update);
router.delete('/beneficios-lealtad/:id', beneficioLealtadController.delete);

// Membresías contacto-programa
router.get('/contactos-programa', contactoProgramaController.getAll);
router.post('/contactos-programa', contactoProgramaController.inscribir);
router.get('/contactos-programa/:id', contactoProgramaController.getById);
router.put('/contactos-programa/:id', contactoProgramaController.actualizar);

// Movimientos de puntos (historial: sin actualización ni eliminación)
router.get('/movimientos-puntos', movimientoPuntosController.getAll);
router.post('/movimientos-puntos', movimientoPuntosController.registrar);
router.get('/movimientos-puntos/:id', movimientoPuntosController.getById);

// Canjes de beneficio
router.get('/canjes-beneficio', canjeBeneficioController.getAll);
router.post('/canjes-beneficio', canjeBeneficioController.solicitar);
router.get('/canjes-beneficio/:id', canjeBeneficioController.getById);
router.patch('/canjes-beneficio/:id/estado', canjeBeneficioController.actualizarEstado);

module.exports = router;

