import { validateDate } from '../validators/helpers.js';

export async function listDay(req, res) {
  const { dayId: id } = req.params;

  const results = {};

  const connection = req.app.locals.db;
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
              time: '$time',
            },
          },
        },
      },
      { $set: { session: '$_id' } },
      { $unset: '_id' },
    ])
    .toArray();

  return res.json(results);
}

export async function listDays(req, res) {
  const days = [];

  const connection = req.app.locals.db;
  const dbs = await connection.db().admin().listDatabases();

  dbs.databases.forEach((db) => {
    if (validateDate(db.name)) days.push(db.name);
  });

  if (!days) return res.status(404).json(null);

  return res.json(days);
}
