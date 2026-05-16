const express = require('express');
const router = express.Router();

const { saveUrls,getUrls } = require('../controllers/gallery.controller');

// OJO: pasá la referencia, NO la invoques
router.post('/', saveUrls);
router.get('/get',getUrls );

module.exports = router;
