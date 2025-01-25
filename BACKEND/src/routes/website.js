const express = require('express');
const router = express.Router();
const websiteController = require('../controller/websiteController');

router.get('/:id', websiteController.website_get);
router.post('/:id/evaluate', websiteController.website_evaluate);
router.delete('/:id', websiteController.website_delete);

router.get('/:id/pages', websiteController.website_pages_list);
router.post('/:id/pages', websiteController.website_page_create);


router.patch('/:id/page/:pageId', websiteController.website_page_update);
router.get('/:id/page/:pageId', websiteController.website_page_get);
router.delete('/:id/page/:pageId', websiteController.website_page_delete);

module.exports = router;