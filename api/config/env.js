const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  const apiRoot = path.resolve(__dirname, '..');

  const candidates = [
    process.env.DOTENV_CONFIG_PATH,
    path.join(apiRoot, '.env'),
    path.join(apiRoot, 'env.env'),
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        return p;
      }
    } catch (_) {
      // ignore fs errors and continue with next candidate
    }
  }

  dotenv.config();
  return null;
}

module.exports = { loadEnv };

