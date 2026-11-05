'use strict';
const { Router } = require('express');
const {
  empleadoController,
  rolAdminController,
  usuarioAdminController,
  usuarioAdminRolController,
  auditoriaAccionController
} = require('../controllers');
const { registrarValidaciones } = require('./validators');

const router = registrarValidaciones(Router());

// PENDIENTE: todas las rutas de este módulo son administrativas y requieren
// autenticación/autorización, que aún no existe en el proyecto.

// Empleados
router.get('/empleados', empleadoController.getAll);
router.post('/empleados', empleadoController.create);
router.get('/empleados/:id', empleadoController.getById);
router.put('/empleados/:id', empleadoController.update);
router.delete('/empleados/:id', empleadoController.delete);

// Roles administrativos
router.get('/roles-admin', rolAdminController.getAll);
router.post('/roles-admin', rolAdminController.create);
router.get('/roles-admin/:id', rolAdminController.getById);
router.put('/roles-admin/:id', rolAdminController.update);
router.delete('/roles-admin/:id', rolAdminController.delete);
router.get('/roles-admin/:rol_admin_id/usuarios', usuarioAdminRolController.getUsuariosPorRol);

// Usuarios administrativos
router.get('/usuarios-admin', usuarioAdminController.getAll);
router.post('/usuarios-admin', usuarioAdminController.create);
router.get('/usuarios-admin/:id', usuarioAdminController.getById);
router.put('/usuarios-admin/:id', usuarioAdminController.update);
router.delete('/usuarios-admin/:id', usuarioAdminController.delete);
router.get('/usuarios-admin/:usuario_admin_id/roles', usuarioAdminRolController.getRolesPorUsuario);

// Asignación de roles (body: usuario_admin_id, rol_admin_id)
router.post('/usuarios-admin-roles', usuarioAdminRolController.asignarRol);
router.delete('/usuarios-admin-roles', usuarioAdminRolController.removerRol);

// Auditoría (solo lectura y registro)
router.get('/auditoria-acciones', auditoriaAccionController.getAll);
router.post('/auditoria-acciones', auditoriaAccionController.registrar);
router.get('/auditoria-acciones/:id', auditoriaAccionController.getById);

module.exports = router;

