import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';

import { router } from './api/index.js';
import { logger } from './utils/logger.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL']);

const { PORT: port = 3456, DATABASE_URL: dbUrl = 'mongodb://127.0.0.1:27017' } =
  process.env;

const app = express();

app.use(cors());
app.use(router);

app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  logger.error('Unable to serve request', err.stack);
  return res.status(500).json({ error: 'Internal server error' });
});

// app.listen(port, () => {
//   console.info(`Server running at http://localhost:${port}/`);
//   logger.info(`Server running at http://localhost:${port}/`);
// });

MongoClient.connect(dbUrl, (err, db) => {
  if (err) {
    logger.error(`Failed to connect to the database. ${err.stack}`);
  }

  app.locals.db = db;
});
