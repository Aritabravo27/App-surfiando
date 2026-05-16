const multer = require('multer');
const {
  uploadGalleryImages,
  uploadMerchImages,
  uploadTeamImages,
  resolveGalleryFolderKey,
  MAX_BYTES,
  ALLOWED_TYPES,
} = require('../services/storageUpload.service');

const uploadFields = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 15 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF.'));
  },
}).fields([{ name: 'photos', maxCount: 15 }]);

async function uploadGallery(req, res) {
  try {
    const files = req.files?.photos;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error:
          'No llegó ninguna foto. Elegí archivos JPG, PNG, WebP o GIF (máx. 5 MB c/u).',
      });
    }
    const folderKey = resolveGalleryFolderKey(req.body?.folder);
    if (!folderKey) {
      return res.status(400).json({
        error: 'Indicá la carpeta: tapas, fotos-en-vivo o cambalache.',
      });
    }
    const urls = await uploadGalleryImages(files, folderKey);
    return res.status(201).json({ urls, count: urls.length, folder: folderKey });
  } catch (err) {
    console.error('uploadGallery error:', err);
    const msg =
      typeof err.message === 'string' ? err.message : 'No se pudieron subir las fotos';
    return res.status(400).json({ error: msg });
  }
}

async function uploadMerch(req, res) {
  try {
    const files = req.files?.photos;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error:
          'No llegó ninguna foto. Elegí archivos JPG, PNG, WebP o GIF (máx. 5 MB c/u).',
      });
    }
    const urls = await uploadMerchImages(files);
    return res.status(201).json({ urls, count: urls.length, folder: 'merch' });
  } catch (err) {
    console.error('uploadMerch error:', err);
    const msg =
      typeof err.message === 'string' ? err.message : 'No se pudieron subir las fotos';
    return res.status(400).json({ error: msg });
  }
}

async function uploadTeam(req, res) {
  try {
    const files = req.files?.photos;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error:
          'No llegó ninguna foto. Elegí archivos JPG, PNG, WebP o GIF (máx. 5 MB c/u).',
      });
    }
    const urls = await uploadTeamImages(files);
    return res.status(201).json({ urls, count: urls.length, folder: 'team' });
  } catch (err) {
    console.error('uploadTeam error:', err);
    const msg =
      typeof err.message === 'string' ? err.message : 'No se pudieron subir las fotos';
    return res.status(400).json({ error: msg });
  }
}

function handleMulterError(err, _req, res, next) {
  if (!err) return next();
  if (err.message && !err.code) {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Alguna foto supera 5 MB. Probá con una más chica o comprimila.',
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Demasiados archivos de una vez (máx. 15).' });
  }
  return next(err);
}

module.exports = {
  uploadGallery,
  uploadMerch,
  uploadTeam,
  uploadPhotosMiddleware: uploadFields,
  handleMulterError,
};
