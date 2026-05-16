const jwt = require('jsonwebtoken');
const { config } = require('../config/appConfig');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere Authorization: Bearer <token>' });
  }
  const token = header.slice(7).trim();
  if (!config.auth.jwtSecret) {
    return res.status(503).json({ error: 'JWT_SECRET no configurado' });
  }
  try {
    jwt.verify(token, config.auth.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { requireAdmin };
