const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { config } = require('./config/appConfig');
const galleryRoutes = require('./routes/gallery.routes');
const audioRoutes = require('./routes/audio.routes');
const authRoutes = require('./routes/auth.routes');
const siteConfigRoutes = require('./routes/siteConfig.routes');
const uploadRoutes = require('./routes/upload.routes');

function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const allowed = config.cors.allowedOrigins;
        if (allowed.length === 0) return cb(null, true);
        if (allowed.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '512kb' }));
  app.use(morgan('dev'));

  app.use('/api/gallery', galleryRoutes);
  app.use('/api/audio', audioRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/config', siteConfigRoutes);
  app.use('/api/upload', uploadRoutes);

  app.get('/api', (_req, res) => {
    res.json({ ok: true });
  });

  const serveStatic = process.env.SERVE_STATIC;
  if (serveStatic) {
    const abs = path.isAbsolute(serveStatic)
      ? serveStatic
      : path.join(__dirname, serveStatic);
    app.use(express.static(abs, { index: false, fallthrough: true }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      if (req.method !== 'GET') {
        return next();
      }
      res.sendFile(path.join(abs, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  } else {
    app.get('/', (_req, res) => {
      res.send('API');
    });
  }

  app.use((err, _req, res, next) => {
    if (!err) return next();
    const msg = typeof err.message === 'string' ? err.message : 'Request blocked';
    if (msg.startsWith('CORS blocked')) {
      return res.status(403).json({ error: msg });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };
