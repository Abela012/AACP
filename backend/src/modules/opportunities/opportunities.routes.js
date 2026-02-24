// Opportunities Routes placeholder
const express = require('express');
const router = express.Router();
const opportunitiesController = require('./opportunities.controller');

router.post('/', opportunitiesController.createOpportunity);

module.exports = router;
