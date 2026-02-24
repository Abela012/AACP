// Collaborations Routes placeholder
const express = require('express');
const router = express.Router();
const collaborationsController = require('./collaborations.controller');

router.get('/:id', collaborationsController.getCollaboration);

module.exports = router;
