const express = require('express');
const { getConfig, putConfig } = require('../controllers/siteConfig.controller');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', getConfig);
router.put('/', requireAdmin, putConfig);

module.exports = router;
