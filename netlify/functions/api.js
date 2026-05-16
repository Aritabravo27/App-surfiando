const serverless = require('serverless-http');
const { ensureSiteDataFile } = require('../../api/services/siteConfig.service');
const { createApp } = require('../../api/createApp');

let handlerPromise;

async function getHandler() {
  await ensureSiteDataFile();
  return serverless(createApp());
}

exports.handler = async (event, context) => {
  if (!handlerPromise) {
    handlerPromise = getHandler();
  }
  const handler = await handlerPromise;
  return handler(event, context);
};
