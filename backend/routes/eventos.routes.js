'use strict';
const { Router } = require('express');
const {
  eventoMercadeoController,
  eventoSesionController,
  expositorController,
  eventoSesionExpositorController,
  eventoInscripcionController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());
const eventEditor = require('../controllers/admin-content.controller').eventos;

// Eventos de mercadeo
router.get('/eventos', eventoMercadeoController.getAll);
router.post('/eventos', eventEditor.save);
router.get('/eventos/slug/:slug', eventoMercadeoController.getBySlug);
router.get('/eventos/:id', eventoMercadeoController.getById);
router.put('/eventos/:id', eventEditor.save);
router.delete('/eventos/:id', eventoMercadeoController.delete);

// Inscripciones a eventos
router.post('/inscripciones-evento', eventoInscripcionController.inscribir); // body: evento_id, contacto_id
router.get('/eventos/:evento_id/inscripciones', eventoInscripcionController.getInscripcionesPorEvento);
router.patch('/eventos/:evento_id/inscripciones/:contacto_id', eventoInscripcionController.actualizarEstado);
router.patch('/eventos/:evento_id/inscripciones/:contacto_id/cancelar', eventoInscripcionController.cancelarInscripcion);
router.get('/contactos/:contacto_id/inscripciones-evento', eventoInscripcionController.getInscripcionesPorContacto);

// Sesiones de evento
router.get('/sesiones-evento', eventoSesionController.getAll);
router.post('/sesiones-evento', eventoSesionController.create);
router.get('/sesiones-evento/:id', eventoSesionController.getById);
router.put('/sesiones-evento/:id', eventoSesionController.update);
router.delete('/sesiones-evento/:id', eventoSesionController.delete);
router.get('/sesiones-evento/:sesion_id/expositores', eventoSesionExpositorController.getExpositoresPorSesion);

// Expositores
router.get('/expositores', expositorController.getAll);
router.post('/expositores', expositorController.create);
router.get('/expositores/:id', expositorController.getById);
router.put('/expositores/:id', expositorController.update);
router.delete('/expositores/:id', expositorController.delete);
router.get('/expositores/:expositor_id/sesiones', eventoSesionExpositorController.getSesionesPorExpositor);

// Asignación sesión-expositor (body: sesion_id, expositor_id)
router.post('/sesiones-expositores', eventoSesionExpositorController.asignarExpositor);
router.delete('/sesiones-expositores', eventoSesionExpositorController.removerExpositor);

module.exports = router;

