const { addUrls, getUrlsDb } = require('../services/gallery.service');

async function saveUrls(req, res) {
  try {
    const { urls } = req.body
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls debe ser un array no vacío' });
    }
    const added = await addUrls(urls);
    return res.status(201).json({ ok: true, added });
  } catch (err) {
    console.error('saveUrls error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getUrls(req, res) {
  try {
    const results = await getUrlsDb();
    return res.json({ results });
  } catch (err) {
    console.error('saveUrls error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { saveUrls, getUrls };
