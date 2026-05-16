const fs = require('fs').promises;
const path = require('path');
const { mergeWithDefaults, defaultSiteConfig } = require('../lib/siteConfigSchema');

function getDataDir() {
  if (process.env.DATA_DIR) {
    return path.resolve(process.env.DATA_DIR);
  }
  if (process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'boiler-api-data');
  }
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    return path.resolve('/app/data');
  }
  return path.join(__dirname, '..', 'data');
}

function getDataFilePath() {
  return path.join(getDataDir(), 'data.json');
}

/** En Netlify/Lambda el JSON en /tmp no se comparte entre invocations: la fuente de verdad es Firestore. */
function useFirestoreForSiteConfig() {
  return !!(process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function firestoreToPlain(data) {
  if (data === null || data === undefined) return data;
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(firestoreToPlain);
  }
  if (typeof data === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(data)) {
      o[k] = firestoreToPlain(v);
    }
    return o;
  }
  return data;
}

async function loadSiteConfigFromFirestore() {
  try {
    const { db } = require('../config/firebase');
    const { config: appCfg } = require('../config/appConfig');
    const ref = db
      .collection(appCfg.firestore.collections.siteConfig)
      .doc(appCfg.firestore.siteConfigDocId);
    const snap = await ref.get();
    if (!snap.exists) return null;
    return mergeWithDefaults(firestoreToPlain(snap.data()));
  } catch (err) {
    console.warn('[siteConfig] Firestore read failed:', err.message);
    return null;
  }
}

async function saveSiteConfigToFirestore(payload) {
  const { db } = require('../config/firebase');
  const { config: appCfg } = require('../config/appConfig');
  const plain = JSON.parse(JSON.stringify(payload));
  await db
    .collection(appCfg.firestore.collections.siteConfig)
    .doc(appCfg.firestore.siteConfigDocId)
    .set(plain);
}

function stripUndefinedDeep(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep).filter((x) => x !== undefined);
  }
  if (value !== null && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      const inner = stripUndefinedDeep(v);
      if (inner === undefined) continue;
      out[k] = inner;
    }
    return out;
  }
  return value;
}

async function ensureSiteDataFile() {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });
  const file = getDataFilePath();
  try {
    await fs.access(file);
  } catch {
    const initial = {
      ...defaultSiteConfig(),
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(file, JSON.stringify(initial), 'utf8');
  }
}

async function getSiteConfig() {
  if (useFirestoreForSiteConfig()) {
    const fromFs = await loadSiteConfigFromFirestore();
    if (fromFs) return fromFs;
  }

  await ensureSiteDataFile();
  const file = getDataFilePath();
  const raw = await fs.readFile(file, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return mergeWithDefaults(parsed);
}

async function saveSiteConfig(validatedConfig) {
  await ensureSiteDataFile();
  const file = getDataFilePath();
  const payload = {
    ...stripUndefinedDeep(validatedConfig),
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(payload), 'utf8');
  await fs.rename(tmp, file);

  if (useFirestoreForSiteConfig()) {
    try {
      await saveSiteConfigToFirestore(payload);
    } catch (err) {
      console.error('[siteConfig] Firestore write failed:', err);
      throw err;
    }
  }

  return getSiteConfig();
}

module.exports = {
  getSiteConfig,
  saveSiteConfig,
  ensureSiteDataFile,
};
