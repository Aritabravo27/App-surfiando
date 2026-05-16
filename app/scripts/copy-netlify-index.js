const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'dist', 'app', 'browser');
const src = path.join(dir, 'index.csr.html');

if (!fs.existsSync(src)) {
  console.error('Missing:', src, '(run Angular build first)');
  process.exit(1);
}

for (const name of ['index.html', '404.html']) {
  fs.copyFileSync(src, path.join(dir, name));
}
