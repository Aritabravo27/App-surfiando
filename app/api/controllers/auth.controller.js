const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../config/appConfig');

async function login(req, res) {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'password es obligatorio' });
    }

    const { jwtSecret, jwtExpires, adminPasswordHash, adminPasswordPlain } = config.auth;

    let ok = false;
    if (adminPasswordHash) {
      ok = await bcrypt.compare(password, adminPasswordHash);
    } else if (adminPasswordPlain) {
      ok = password === adminPasswordPlain;
    } else {
      return res.status(503).json({
        error:
          'Admin no configurado: definí ADMIN_PASSWORD_HASH (recomendado) o ADMIN_PASSWORD (solo desarrollo)',
      });
    }

    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!jwtSecret) {
      return res.status(503).json({ error: 'JWT_SECRET no configurado' });
    }

    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: jwtExpires });
    return res.json({ token, expiresIn: jwtExpires });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { login };
