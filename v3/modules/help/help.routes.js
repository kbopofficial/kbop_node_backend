const express = require('express');
const router = express.Router();
const { getHelp, createHelp, updateHelp, deleteHelp } = require('./help.controller');

router.get('/', getHelp);
router.post('/', createHelp);
router.put('/:id', updateHelp);
router.delete('/:id', deleteHelp);

module.exports = router;
