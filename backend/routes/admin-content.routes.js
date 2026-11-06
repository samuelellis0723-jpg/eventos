'use strict';
const { Router } = require('express');
const controllers = require('../controllers/admin-content.controller');
const { registrarValidaciones } = require('./validators');
const router = registrarValidaciones(Router());
for (const kind of ['eventos', 'promociones', 'lealtad', 'encuestas']) {
  router.get('/' + kind, controllers[kind].list);
  router.post('/' + kind, controllers[kind].save);
  router.get('/' + kind + '/:id', controllers[kind].get);
  router.put('/' + kind + '/:id', controllers[kind].save);
}
module.exports = router;
