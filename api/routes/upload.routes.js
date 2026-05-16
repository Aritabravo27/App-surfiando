const express = require('express');
const { requireAdmin } = require('../middleware/requireAdmin');
const {
  uploadGallery,
  uploadMerch,
  uploadTeam,
  uploadPhotosMiddleware,
  handleMulterError,
} = require('../controllers/upload.controller');

const router = express.Router();

function runMulter(req, res, next) {
  uploadPhotosMiddleware(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}

router.post('/gallery', requireAdmin, runMulter, uploadGallery);
router.post('/merch', requireAdmin, runMulter, uploadMerch);
router.post('/team', requireAdmin, runMulter, uploadTeam);

module.exports = router;
