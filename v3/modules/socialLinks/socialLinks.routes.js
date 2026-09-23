const express = require('express');
const router = express.Router();
const { getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } = require('./socialLinks.controller');

router.get('/', getAllSocialLinks);
router.post('/', createSocialLink);
router.put('/:id', updateSocialLink);
router.delete('/:id', deleteSocialLink);

module.exports = router;
