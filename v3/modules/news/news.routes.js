const express = require('express');
const router = express.Router();
const { getAllNews, syncNews, createNews, updateNews, deleteNews } = require('./news.controller');

router.get('/sync', syncNews);
router.get('/', getAllNews);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

module.exports = router;
