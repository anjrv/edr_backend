import * as csv from 'csv';

export async function sampleSession(req, res) {
  const { dayId, sessionId } = req.params;

  let results = [];

  const connection = req.app.locals.db;
  const collection = connection.db(dayId).collection(sessionId);

  const count = await collection.count({});
  results = await collection
    .aggregate([
      { $sample: { size: Math.max(Math.floor(count * 0.0001), 1) } },
      {
        $project: {
          _id: 0,
          lat: 1,
          lon: 1,
          alt: 1,
          ms: 1,
          time: 1,
          rms: 1,
          edr_rms: 1,
        },
      },
    ])
    .toArray();

  return res.json(results);
}

function transformer(line) {
  return {
    time: line.time,
    gps_accuracy: line.acc,
    altitude: line.alt,
    latitude: line.lat,
    longitude: line.lon,
    wind_avg: line.windAvg,
    wind_max: line.windMax,
    wind_direction: line.windDir,
    wind_method: line.windMethod,
    wind_source: line.windSource,
    speed_ms_assumed: line.ms,
    speed_ms_measured: line.ms0,
    z: line.z,
    fz: line.fz,
    std: line.std,
    rms: line.rms,
    edr: line.edr,
    edr_rms: line.edr_rms,
    manufacturer: line.manufacturer,
    model: line.model,
    version: line.version,
  };
}

export async function csvSession(req, res) {
  const { dayId, sessionId } = req.params;

  const connection = req.app.locals.db;
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
    .pipe(res);
}
