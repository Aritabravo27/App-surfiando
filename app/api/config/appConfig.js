const { loadEnv } = require('./env');

const loadedFrom = loadEnv();

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const defaultCorsOrigins = [
  'https://surfiando.netlify.app',
  'http://surfiando.netlify.app',
  'http://localhost:4200',
];

function mergeCorsOrigins() {
  const fromEnv = parseList(process.env.ALLOWED_ORIGINS);
  return [...new Set([...defaultCorsOrigins, ...fromEnv])];
}

const config = {
  envFile: loadedFrom,
  port: Number(process.env.PORT) || 3000,
  cors: {
    allowedOrigins: mergeCorsOrigins(),
  },
  firestore: {
    collections: {
      gallery: process.env.FIRESTORE_GALLERY_COLLECTION || 'gallery',
      audio: process.env.FIRESTORE_AUDIO_COLLECTION || 'audio',
      siteConfig: process.env.FIRESTORE_SITE_CONFIG_COLLECTION || 'siteConfig',
    },
    siteConfigDocId: process.env.FIRESTORE_SITE_CONFIG_DOC_ID || 'main',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpires: process.env.JWT_EXPIRES || '7d',
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
    adminPasswordPlain:
      process.env.NODE_ENV !== 'production' ? process.env.ADMIN_PASSWORD || '' : '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      (process.env.FIREBASE_PROJECT_ID
        ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
        : ''),
  },
};

module.exports = { config };

