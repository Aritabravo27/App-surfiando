const express = require('express');
const router = express.Router();

const { saveAudioUrls,getAudiosUrls } = require('../controllers/audio.controller');

router.post('/post', saveAudioUrls);
router.get('/get',getAudiosUrls );

module.exports = router;
