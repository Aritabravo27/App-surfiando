const { admin, db } = require('../config/firebase');
const { config } = require('../config/appConfig');

async function addUrls(urls = []) {
  if (!Array.isArray(urls) || urls.length === 0) throw new Error('urls vacío');
  const batch = db.batch();
  for (const u of urls) {
    if (!u || typeof u !== 'object') continue;
    const name = typeof u.name === 'string' ? u.name.trim() : '';
    const url = typeof u.url === 'string' ? u.url.trim() : '';
    if (!name || !url) continue;
    const ref = db.collection(config.firestore.collections.audio).doc(name);
    batch.set(ref, { url, name });
  }

  try {
    const writes = await batch.commit();
    return writes.length;
  } catch (e) {
    console.error('[Firestore] batch.commit error:', e, 'projectId:', admin.app().options.projectId);
    throw e;
  }
}

async function getUrlsDb() {
  const snap = await db.collection(config.firestore.collections.audio).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

module.exports = { addUrls, getUrlsDb };
