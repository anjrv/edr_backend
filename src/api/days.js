import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { logger } from '../utils/logger.js';

dotenv.config();

const { DATABASE_URL: db = 'mongodb://127.0.0.1:27017' } = process.env;

const mongoClient = new MongoClient(db);

function validateDate(date) {
  return isNaN(date) && !isNaN(Date.parse(date));
}

export async function listDay(req, res) {
  const { dayId: id } = req.params;

  // Malformed, dont start a connection
  if (!validateDate(id)) return res.status(400).end();

  const connection = await mongoClient.connect();
  const db = connection.db(id);

  const results = {};

  results.sessions = await db
    .collection('sessions')
    .find({})
    .project({ _id: 0 })
    .toArray();

  results.anomalies = await db
    .collection('anomalies')
    .aggregate([
      {
        $group: {
          _id: '$session',
          measurements: {
            $push: {
              alt: '$alt',
              lat: '$lat',
              lon: '$lon',
              edr: '$edr',
              ms: '$ms',
            },
          },
        },
      },
      { $set: { session: '$_id' } },
      { $unset: '_id' },
    ])
    .toArray();

  await mongoClient.close();

  return res.json(results);
}

export async function listDays(_req, res) {
  const connection = await mongoClient.connect();
  const dbs = await connection.db('api').admin().listDatabases();
  const days = [];

  dbs.databases.forEach((db) => {
    if (validateDate(db.name)) days.push(db.name);
  });

  await mongoClient.close();

  if (!days) return res.status(404).json(null);

  return res.json(days);
}
