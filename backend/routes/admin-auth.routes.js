'use strict';

const { Router } = require('express');
const controller = require('../controllers/admin-auth.controller');
const {
  authenticateAdmin,
  requireAllowedOrigin,
  requirePreAuthCsrf,
  protectMutatingRequests
} = require('../middleware/admin-auth');

const router = Router();

router.get('/csrf', controller.issueCsrf);
router.post('/login', requireAllowedOrigin, requirePreAuthCsrf, controller.login);
router.get('/session', authenticateAdmin, controller.getSession);
router.post('/logout', authenticateAdmin, protectMutatingRequests, controller.logout);

module.exports = router;
