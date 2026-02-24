// Applications Routes placeholder
const express = require('express');
const router = express.Router();
const applicationsController = require('./applications.controller');

router.post('/apply', applicationsController.applyToOpportunity);

module.exports = router;
