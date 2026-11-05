'use strict';
const { Router } = require('express');
const {
  categoriaContenidoController,
  contenidoPublicoController,
  contenidoCategoriaController,
  calendarioContenidoController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());

// Categorías de contenido
router.get('/categorias-contenido', categoriaContenidoController.getAll);
router.post('/categorias-contenido', categoriaContenidoController.create);
router.get('/categorias-contenido/:id', categoriaContenidoController.getById);
router.put('/categorias-contenido/:id', categoriaContenidoController.update);
router.delete('/categorias-contenido/:id', categoriaContenidoController.delete);
router.get('/categorias-contenido/:categoria_id/contenidos', contenidoCategoriaController.getContenidosPorCategoria);

// Contenido público
router.get('/contenidos', contenidoPublicoController.getAll);
router.post('/contenidos', contenidoPublicoController.create);
router.get('/contenidos/slug/:slug', contenidoPublicoController.getBySlug);
router.get('/contenidos/:id', contenidoPublicoController.getById);
router.put('/contenidos/:id', contenidoPublicoController.update);
router.delete('/contenidos/:id', contenidoPublicoController.delete);
router.get('/contenidos/:contenido_id/categorias', contenidoCategoriaController.getCategoriasPorContenido);

// Asociación contenido-categoría (body: contenido_id, categoria_id)
router.post('/contenidos-categorias', contenidoCategoriaController.asociar);
router.delete('/contenidos-categorias', contenidoCategoriaController.desasociar);

// Calendario editorial
router.get('/calendario-contenido', calendarioContenidoController.getAll);
router.post('/calendario-contenido', calendarioContenidoController.create);
router.get('/calendario-contenido/:id', calendarioContenidoController.getById);
router.put('/calendario-contenido/:id', calendarioContenidoController.update);
router.delete('/calendario-contenido/:id', calendarioContenidoController.delete);

module.exports = router;

