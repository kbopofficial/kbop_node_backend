const express = require('express');
const router = express.Router();
const { getAllEmergency, syncEmergency, createEmergency, updateEmergency, deleteEmergency } = require('./emergency.controller');

router.get('/sync', syncEmergency);
router.get('/', getAllEmergency);
router.post('/', createEmergency);
router.put('/:id', updateEmergency);
router.delete('/:id', deleteEmergency);

module.exports = router;
