import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { validateDate } from '../validators/helpers.js'

dotenv.config();

const { DATABASE_URL: db = 'mongodb://127.0.0.1:27017' } = process.env;

const mongoClient = new MongoClient(db);

export async function listDay(req, res) {
  const { dayId: id } = req.params;

  const results = {};

  try {
    const connection = await mongoClient.connect();
    const db = connection.db(id);

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
                time: '$time'
              },
            },
          },
        },
        { $set: { session: '$_id' } },
        { $unset: '_id' },
      ])
      .toArray();
  } finally {
    await mongoClient.close();
  }

  return res.json(results);
}

export async function listDays(_req, res) {
  const days = [];

  try {
    const connection = await mongoClient.connect();
    const dbs = await connection.db().admin().listDatabases();

    dbs.databases.forEach((db) => {
      if (validateDate(db.name)) days.push(db.name);
    });
  } finally {
    await mongoClient.close();
  }

  if (!days) return res.status(404).json(null);

  return res.json(days);
}
