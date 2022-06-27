import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { readFile } from '../utils/fileSystem.js';

// TODO: Import routes and validators

export const router = express.Router();

// TODO: Routing definitions

router.get('/', async (_req, res) => {
  const path = dirname(fileURLToPath(import.meta.url));
  const indexJson = await readFile(join(path, './index.json'));
  res.json(JSON.parse(indexJson));
});
