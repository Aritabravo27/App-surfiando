const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: admin.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

module.exports = { admin, db };
