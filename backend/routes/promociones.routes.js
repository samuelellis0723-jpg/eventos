'use strict';
const { Router } = require('express');
const {
  promocionController,
  promocionProductoController,
  cuponController,
  promocionCanjeController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());
const promotionEditor = require('../controllers/admin-content.controller').promociones;

// Promociones
router.get('/promociones', promocionController.getAll);
router.post('/promociones', promotionEditor.save);
router.get('/promociones/slug/:slug', promocionController.getBySlug);
router.get('/promociones/:id', promocionController.getById);
router.put('/promociones/:id', promotionEditor.save);
router.delete('/promociones/:id', promocionController.delete);
router.get('/promociones/:promocion_id/productos', promocionProductoController.getProductosPorPromocion);
router.get('/productos-seguro/:producto_id/promociones', promocionProductoController.getPromocionesPorProducto);

// Asociación promoción-producto (body: promocion_id, producto_id)
router.post('/promociones-productos', promocionProductoController.asociarProducto);
router.delete('/promociones-productos', promocionProductoController.desasociarProducto);

// Cupones
router.get('/cupones', cuponController.getAll);
router.post('/cupones', cuponController.create);
router.get('/cupones/codigo/:codigo', cuponController.getByCodigo);
router.get('/cupones/:id', cuponController.getById);
router.put('/cupones/:id', cuponController.update);
router.delete('/cupones/:id', cuponController.delete);

// Canjes de promoción (registro transaccional: sin actualización ni eliminación)
router.get('/canjes-promocion', promocionCanjeController.getAll);
router.post('/canjes-promocion', promocionCanjeController.registrar);
router.get('/canjes-promocion/:id', promocionCanjeController.getById);

module.exports = router;

