'use strict';

const { Router } = require('express');
const publicController = require('../controllers/public.controller');

const { registrarValidaciones } = require('./validators');
const router = registrarValidaciones(Router());

router.get('/eventos', publicController.getEvents);
router.get('/promociones', publicController.getPromotions);
router.get('/programas-lealtad', publicController.getLoyaltyPrograms);
router.get('/encuestas', publicController.getSurveys);
router.get('/encuestas/:slug', publicController.getSurveyBySlug);
router.post('/encuestas/:slug/respuestas', require('../controllers/public-survey-submit.controller'));

module.exports = router;
