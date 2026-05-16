/**
 * Uso: node scripts/hash-admin-password.js "tu_password_seguro"
 * Copiá la salida a ADMIN_PASSWORD_HASH en env.env
 */
const bcrypt = require('bcryptjs');

const pwd = process.argv[2];
if (!pwd) {
  console.error('Uso: node scripts/hash-admin-password.js "<password>"');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(pwd, salt);
console.log(hash);
