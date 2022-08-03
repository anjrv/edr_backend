import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { readFile } from '../utils/fileSystem.js';
import { catchErrors } from '../utils/catchErrors.js';
import { validationCheck } from '../validators/helpers.js';
import {
  dayIdValidator,
  sessionIdValidator,
} from '../validators/validators.js';

import { sendApk } from './apk.js';
import { listDay, listDays } from './days.js';
import { sampleSession, csvSession } from './sessions.js';

export const router = express.Router();

router.get('/', async (_req, res) => {
  const path = dirname(fileURLToPath(import.meta.url));
  const indexJson = await readFile(join(path, './index.json'));
  res.json(JSON.parse(indexJson));
});

router.get('/app', sendApk);

router.get('/days', validationCheck, catchErrors(listDays));

router.get(
  '/days/:dayId',
  dayIdValidator,
  validationCheck,
  catchErrors(listDay)
);

router.get(
  '/days/:dayId/sessions/:sessionId/sample',
  dayIdValidator,
  sessionIdValidator,
  validationCheck,
  catchErrors(sampleSession)
);

router.get(
  '/days/:dayId/sessions/:sessionId/csv',
  dayIdValidator,
  sessionIdValidator,
  validationCheck,
  catchErrors(csvSession)
);
