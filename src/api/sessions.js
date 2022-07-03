import dotenv from 'dotenv';
import * as csv from 'csv';
import { MongoClient } from 'mongodb';

dotenv.config();

const { DATABASE_URL: db = 'mongodb://127.0.0.1:27017' } = process.env;

const mongoClient = new MongoClient(db);

export async function sampleSession(req, res) {
  const { dayId, sessionId } = req.params;

  let results = [];

  try {
    const connection = await mongoClient.connect();
    const collection = connection.db(dayId).collection(sessionId);

    const count = await collection.count({});
    results = await collection
      .aggregate([
        { $sample: { size: Math.max(Math.floor(count * 0.0001), 1) } },
        {
          $project: { _id: 0, lat: 1, lon: 1, alt: 1, ms: 1, time: 1, edr: 1 },
        },
      ])
      .toArray();
  } finally {
    await mongoClient.close();
  }

  return res.json(results);
}

function transformer(line) {
  return {
    time: line.time,
    gps_accuracy: line.acc,
    altitude: line.alt,
    latitude: line.lat,
    longitude: line.lon,
    speed_ms_assumed: line.ms,
    speed_ms_measured: line.ms0,
    z: line.z,
    fz: line.fz,
    std: line.std,
    edr: line.edr,
    manufacturer: line.manufacturer,
    model: line.model,
    version: line.version,
  };
}

export async function csvSession(req, res) {
  const { dayId, sessionId } = req.params;

  try {
    const connection = await mongoClient.connect();
    const collection = connection.db(dayId).collection(sessionId);
    const cursor = collection.find({});

    res.setHeader(
      'Content-disposition',
      `attachment; filename=${sessionId + '.csv'}`
    );
    res.writeHead(200, { 'Content-Type': 'text/csv' });
    res.flushHeaders();

    cursor
      .stream()
      .pipe(csv.transform(transformer))
      .pipe(csv.stringify({ header: true }))
      .pipe(res)
      .once('end', function () {
        mongoClient.close();
      });
  } catch (err) {
    // Ensure client quits even if pipe breaks
    await mongoClient.close();
    throw err;
  }
}