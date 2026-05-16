const crypto = require('crypto');
const path = require('path');
const { admin } = require('../config/firebase');
const { config } = require('../config/appConfig');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

const GALLERY_PREFIX = {
  tapas: 'images/tapas',
  'fotos-en-vivo': 'images/fotos-en-vivo',
  cambalache: 'images/cambalache',
};

const MERCH_PREFIX = 'images/merch';
const TEAM_PREFIX = 'images/team';

function resolveGalleryFolderKey(raw) {
  const k = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
  if (k === 'tapas') return 'tapas';
  if (k === 'fotos-en-vivo' || k === 'fotosenvivo') return 'fotos-en-vivo';
  if (k === 'cambalache') return 'cambalache';
  return null;
}

function getBucket() {
  const bucketName = config.firebase.storageBucket;
  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET no está configurado (ni se pudo derivar del proyecto)');
  }
  return admin.storage().bucket(bucketName);
}

function sanitizeFilename(name) {
  const base = path.basename(name || 'foto.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 120) || 'foto.jpg';
}

async function saveBufferToPrefix(buffer, originalName, mimeType, prefix) {
  if (!buffer || !buffer.length) {
    throw new Error('Archivo vacío');
  }
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error(
      `Formato no permitido (${mimeType}). Subí solo JPG, PNG, WebP o GIF.`
    );
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error('La foto pesa más de 5 MB. Comprimirla o subir otra más chica.');
  }

  const bucket = getBucket();
  const token = crypto.randomUUID();
  const safeName = sanitizeFilename(originalName);
  const dest = `${prefix}/${Date.now()}_${safeName}`;

  const file = bucket.file(dest);
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const encodedPath = encodeURIComponent(dest);
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
  return { url, path: dest };
}

async function uploadGalleryImage(buffer, originalName, mimeType, folderKey) {
  const galleryPrefix = GALLERY_PREFIX[folderKey];
  if (!galleryPrefix) {
    throw new Error('Carpeta de galería inválida');
  }
  return saveBufferToPrefix(buffer, originalName, mimeType, galleryPrefix);
}

async function uploadGalleryImages(files, folderKey) {
  if (!GALLERY_PREFIX[folderKey]) {
    throw new Error('Carpeta de galería inválida');
  }
  const urls = [];
  for (const f of files) {
    const mime = f.mimetype || 'application/octet-stream';
    const { url } = await uploadGalleryImage(f.buffer, f.originalname, mime, folderKey);
    urls.push(url);
  }
  return urls;
}

async function uploadMerchImages(files) {
  const urls = [];
  for (const f of files) {
    const mime = f.mimetype || 'application/octet-stream';
    const { url } = await saveBufferToPrefix(f.buffer, f.originalname, mime, MERCH_PREFIX);
    urls.push(url);
  }
  return urls;
}

async function uploadTeamImages(files) {
  const urls = [];
  for (const f of files) {
    const mime = f.mimetype || 'application/octet-stream';
    const { url } = await saveBufferToPrefix(f.buffer, f.originalname, mime, TEAM_PREFIX);
    urls.push(url);
  }
  return urls;
}

module.exports = {
  uploadGalleryImages,
  uploadMerchImages,
  uploadTeamImages,
  resolveGalleryFolderKey,
  MAX_BYTES,
  ALLOWED_TYPES,
};
