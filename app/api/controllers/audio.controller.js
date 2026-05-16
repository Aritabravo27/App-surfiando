const { addUrls, getUrlsDb } = require('../services/audio.service');

async function saveAudioUrls(req, res) {
  try {
    const { urls } = req.body
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls debe ser un array no vacío' });
    }
    const invalid = urls.some((u) => !u || typeof u !== 'object' || typeof u.name !== 'string' || typeof u.url !== 'string');
    if (invalid) {
      return res.status(400).json({
        error: 'urls debe ser un array de objetos { name: string, url: string }',
      });
    }
    const added = await addUrls(urls);
    return res.status(201).json({ ok: true, added });
  } catch (err) {
    console.error('saveUrls error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAudiosUrls(req, res) {
  try {
    const results = await getUrlsDb();
    return res.json({ results });
  } catch (err) {
    console.error('saveUrls error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { saveAudioUrls, getAudiosUrls };
