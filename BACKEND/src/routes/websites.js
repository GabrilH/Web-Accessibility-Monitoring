const express = require('express');
const router = express.Router();
const websiteController = require('../controller/websiteController');

router.get('/', websiteController.website_list);
router.post('/', websiteController.website_create);

module.exports = router;