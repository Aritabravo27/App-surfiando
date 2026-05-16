const path = require('path');
const admin = require('firebase-admin');
const { config } = require('./appConfig');

function loadLocalServiceAccount() {
  try {
    return require(path.join(__dirname, 'sufiando-firebase-adminsdk-fbsvc-02a31277cf.json'));
  } catch {
    return null;
  }
}

function parseServiceAccountFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw || !String(raw).trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON debe ser un JSON válido (service account de Firebase).');
  }
}

function isServerlessRuntime() {
  return !!(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

if (!admin.apps.length) {
  const fromEnv = parseServiceAccountFromEnv();
  const local = loadLocalServiceAccount();
  const projectId =
    config.firebase.projectId || fromEnv?.project_id || local?.project_id;

  if (fromEnv) {
    if (!projectId) {
      throw new Error(
        'FIREBASE_PROJECT_ID es obligatorio cuando usás FIREBASE_SERVICE_ACCOUNT_JSON (o incluí project_id en el JSON).'
      );
    }
    const opts = {
      credential: admin.credential.cert(fromEnv),
      projectId,
    };
    if (config.firebase.storageBucket) {
      opts.storageBucket = config.firebase.storageBucket;
    }
    admin.initializeApp(opts);
  } else if (local) {
    admin.initializeApp({
      credential: admin.credential.cert(local),
      projectId,
    });
  } else if (config.firebase.googleApplicationCredentials && !isServerlessRuntime()) {
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID es obligatorio cuando usás GOOGLE_APPLICATION_CREDENTIALS');
    }
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  } else if (isServerlessRuntime()) {
    throw new Error(
      'Firebase Admin en Netlify/Functions: definí FIREBASE_SERVICE_ACCOUNT_JSON con el JSON completo del service account. ' +
        'Quitá GOOGLE_APPLICATION_CREDENTIALS del panel (rutas tipo ./…json no existen en el runtime serverless).'
    );
  } else {
    throw new Error(
      'Firebase: en Netlify/serverless definí FIREBASE_SERVICE_ACCOUNT_JSON + FIREBASE_PROJECT_ID; en Railway GOOGLE_APPLICATION_CREDENTIALS + FIREBASE_PROJECT_ID; o agregá el JSON adminsdk junto a config/firebase.js para desarrollo local.'
    );
  }
}

const db = admin.firestore();

module.exports = { admin, db };
