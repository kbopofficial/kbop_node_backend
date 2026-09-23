const express = require('express');
const router = express.Router();
const { getAbout, createAbout, updateAbout, deleteAbout } = require('./about.controller');

router.get('/', getAbout);
router.post('/', createAbout);
router.put('/:id', updateAbout);
router.delete('/:id', deleteAbout);

module.exports = router;
