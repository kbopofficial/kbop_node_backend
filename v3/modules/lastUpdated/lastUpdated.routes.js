const express = require('express');
const router = express.Router();
const { getLastUpdated } = require('./lastUpdated.controller');

router.get('/', getLastUpdated);

module.exports = router;
