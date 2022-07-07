import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { router } from './api/index.js';
import { logger } from './utils/logger.js';
import requireEnv from './utils/requireEnv.js';

dotenv.config();
requireEnv(['DATABASE_URL']);

// Default port is 3000, alternatives should be provided in .env
const { PORT: port = 3456, DATABASE_URL: dbUrl = 'mongodb://127.0.0.1:27017' } =
  process.env;

const app = express();

/**
 * CORS policy definitions
 */
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

app.use(router);

app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  logger.error('Unable to serve request', err.stack);
  return res.status(500).json({ error: 'Internal server error' });
});

MongoClient.connect(dbUrl, (err, db) => {
  if (err) {
    logger.error(`Failed to connect to the database. ${err.stack}`);
  }

  app.locals.db = db;
  app.listen(port, () => {
    console.info(`Server running at http://localhost:${port}/`);
    logger.info(`Server running at http://localhost:${port}/`);
  });
});
