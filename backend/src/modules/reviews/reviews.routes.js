// Reviews Routes placeholder
const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');

router.post('/', reviewsController.createReview);

module.exports = router;
