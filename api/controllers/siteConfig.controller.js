const { validateSiteConfigForPut } = require('../lib/siteConfigSchema');
const { getSiteConfig, saveSiteConfig } = require('../services/siteConfig.service');

function serializeUpdatedAt(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const out = { ...doc };
  const u = out.updatedAt;
  if (u && typeof u.toDate === 'function') {
    out.updatedAt = u.toDate().toISOString();
  }
  return out;
}

async function getConfig(req, res) {
  try {
    const data = await getSiteConfig();
    res.set('Cache-Control', 'no-store');
    return res.json(serializeUpdatedAt(data));
  } catch (err) {
    console.error('getConfig error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function putConfig(req, res) {
  try {
    const parsed = validateSiteConfigForPut(req.body);
    if (!parsed.ok) {
      return res.status(400).json({ error: parsed.error });
    }
    const saved = await saveSiteConfig(parsed.value);
    return res.json(serializeUpdatedAt(saved));
  } catch (err) {
    console.error('putConfig error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getConfig, putConfig };
