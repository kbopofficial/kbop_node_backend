const express = require('express');
const router = express.Router();

router.use('/lastupdated', require('./modules/lastUpdated/lastUpdated.routes'));
router.use('/cities', require('./modules/city/city.routes'));
router.use('/buses', require('./modules/bus/bus.routes'));
router.use('/team', require('./modules/team/team.routes'));
router.use('/news', require('./modules/news/news.routes'));
router.use('/about', require('./modules/about/about.routes'));
router.use('/emergency', require('./modules/emergency/emergency.routes'));
router.use('/social-links', require('./modules/socialLinks/socialLinks.routes'));
router.use('/admin', require('./modules/admin/admin.routes'));
router.use('/event', require('./modules/event/event.routes'));
router.use('/help', require('./modules/help/help.routes'));

module.exports = router;
