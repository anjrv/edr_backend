import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function sendApk(_req, res) {
  const apk = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'data',
    'eddy.apk'
  );

  if (!fs.existsSync(apk)) {
    return res.status(404).send('APK not available');
  }

  res.download(apk);
}
