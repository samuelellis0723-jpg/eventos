'use strict';
const { Router } = require('express');
const {
  encuestaController,
  encuestaPreguntaController,
  encuestaOpcionController,
  encuestaParticipacionController,
  encuestaRespuestaController,
  encuestaRespuestaOpcionController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());
const surveyEditor = require('../controllers/admin-content.controller').encuestas;
// El grafo se escribe de forma atómica. Las rutas anteriores de lectura se conservan.
router.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (/^\/(preguntas-encuesta|opciones-encuesta)(\/|$)/.test(req.path) || (req.method === 'DELETE' && /^\/encuestas\//.test(req.path))) {
    return res.status(409).json({ success: false, message: 'Usa el editor completo de /api/admin/encuestas para conservar preguntas y respuestas. Archiva la encuesta en lugar de eliminarla.' });
  }
  return next();
});

// Encuestas
router.get('/encuestas', encuestaController.getAll);
router.post('/encuestas', surveyEditor.save);
router.get('/encuestas/slug/:slug', encuestaController.getBySlug);
router.get('/encuestas/:id', encuestaController.getById);
router.put('/encuestas/:id', surveyEditor.save);
router.delete('/encuestas/:id', encuestaController.delete);

// Preguntas
router.get('/preguntas-encuesta', encuestaPreguntaController.getAll);
router.post('/preguntas-encuesta', encuestaPreguntaController.create);
router.get('/preguntas-encuesta/:id', encuestaPreguntaController.getById);
router.put('/preguntas-encuesta/:id', encuestaPreguntaController.update);
router.delete('/preguntas-encuesta/:id', encuestaPreguntaController.delete);

// Opciones
router.get('/opciones-encuesta', encuestaOpcionController.getAll);
router.post('/opciones-encuesta', encuestaOpcionController.create);
router.get('/opciones-encuesta/:id', encuestaOpcionController.getById);
router.put('/opciones-encuesta/:id', encuestaOpcionController.update);
router.delete('/opciones-encuesta/:id', encuestaOpcionController.delete);

// Participaciones
router.get('/participaciones-encuesta', encuestaParticipacionController.getAll);
router.post('/participaciones-encuesta', encuestaParticipacionController.iniciar);
router.get('/participaciones-encuesta/:id', encuestaParticipacionController.getById);
router.patch('/participaciones-encuesta/:id/enviar', encuestaParticipacionController.enviar);

// Respuestas
router.get('/respuestas-encuesta', encuestaRespuestaController.getAll);
router.post('/respuestas-encuesta', encuestaRespuestaController.create);
router.get('/respuestas-encuesta/:id', encuestaRespuestaController.getById);
router.get('/respuestas-encuesta/:respuesta_id/opciones', encuestaRespuestaOpcionController.getOpcionesPorRespuesta);

// Opciones seleccionadas en una respuesta (body: respuesta_id, opcion_id)
router.post('/respuestas-opciones', encuestaRespuestaOpcionController.asociar);
router.delete('/respuestas-opciones', encuestaRespuestaOpcionController.desasociar);

module.exports = router;

