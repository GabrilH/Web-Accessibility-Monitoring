const express = require('express');
const router = express.Router();
const initController = require('../controller/initController');

router.get('/', initController.init);

module.exports = router;