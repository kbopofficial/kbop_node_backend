const express = require('express');
const router = express.Router();
const {
    getAllBuses, getBusNames, getBusById, getDisabledBuses,
    getBusesViaStop, getBusesFromTo, createBus, updateBus, deleteBus
} = require('./bus.controller');

router.get('/names', getBusNames);
router.get('/disabled', getDisabledBuses);
router.get('/via', getBusesViaStop);
router.get('/from-to', getBusesFromTo);
router.get('/:id', getBusById);
router.get('/', getAllBuses);
router.post('/', createBus);
router.put('/:id', updateBus);
router.delete('/:id', deleteBus);

module.exports = router;
