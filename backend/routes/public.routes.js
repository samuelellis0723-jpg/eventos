'use strict';

const { Router } = require('express');
const publicController = require('../controllers/public.controller');

const router = Router();

router.get('/eventos', publicController.getEvents);
router.get('/promociones', publicController.getPromotions);
router.get('/programas-lealtad', publicController.getLoyaltyPrograms);
router.get('/encuestas', publicController.getSurveys);
router.get('/encuestas/:slug', publicController.getSurveyBySlug);

module.exports = router;
