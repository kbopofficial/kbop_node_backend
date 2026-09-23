const express = require('express');
const router = express.Router();
const { getAllCities, getAllStops, createCity, updateCity, deleteCity } = require('./city.controller');

router.get('/allstops', getAllStops);
router.get('/', getAllCities);
router.post('/', createCity);
router.put('/:id', updateCity);
router.delete('/:id', deleteCity);

module.exports = router;
