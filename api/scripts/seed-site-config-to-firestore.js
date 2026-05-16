/**
 * Copia api/data/data.json al documento Firestore siteConfig/main (o el id que defina el env).
 * Así el deploy en Netlify ve la misma galería/pestañas que en local.
 *
 * Uso (desde la carpeta api, con env.env o credenciales listas):
 *   node scripts/seed-site-config-to-firestore.js
 */
const path = require('path');
const fs = require('fs').promises;
const { loadEnv } = require('../config/env');
const { mergeWithDefaults } = require('../lib/siteConfigSchema');

loadEnv();

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'data.json');
  let raw;
  try {
    raw = await fs.readFile(dataPath, 'utf8');
  } catch {
    console.error('No existe', dataPath, '— guardá la config desde el admin local al menos una vez.');
    process.exit(1);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('JSON inválido en data.json');
    process.exit(1);
  }

  const merged = mergeWithDefaults(parsed);
  merged.updatedAt = new Date().toISOString();
  const plain = JSON.parse(JSON.stringify(merged));

  const { db } = require('../config/firebase');
  const { config: appCfg } = require('../config/appConfig');
  const col = appCfg.firestore.collections.siteConfig;
  const id = appCfg.firestore.siteConfigDocId;
  await db.collection(col).doc(id).set(plain);
  console.log('Listo: Firestore', `${col}/${id}`, 'actualizado desde data.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
