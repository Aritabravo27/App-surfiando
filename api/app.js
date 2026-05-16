const { createApp } = require('./createApp');
const { config } = require('./config/appConfig');
const { ensureSiteDataFile } = require('./services/siteConfig.service');

async function start() {
  await ensureSiteDataFile();
  const app = createApp();
  const host = '0.0.0.0';
  app.listen(config.port, host, () => {});
}

if (require.main === module) {
  start().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { createApp };
