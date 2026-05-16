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
  return getSiteConfig();
}

module.exports = {
  getSiteConfig,
  saveSiteConfig,
  ensureSiteDataFile,
};
