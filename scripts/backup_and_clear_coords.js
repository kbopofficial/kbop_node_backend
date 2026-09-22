/**
 * backup_and_clear_coords.js
 *
 * 1. Connects to MongoDB using the MONGO_URL from .env
 * 2. Fetches ALL buses from Location_BUS_SCHEMA collection
 * 3. Saves a full JSON backup to  scripts/backup_buses_<timestamp>.json
 * 4. Sets coordinate = null for every stop in every bus
 * 5. Prints a summary
 *
 * Run: node scripts/backup_and_clear_coords.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ── Inline schema (mirrors Location_Bus.js) ───────────────────────────────────
const Location_Bus_Schema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    route: { type: String, default: '' },
    status: { type: String, default: '' },
    image_url: { type: String, default: '' },
    enable: { type: Boolean, default: true },
    firstservice: { type: Number, default: null },
    lastservice: { type: Number, default: null },
    stops: [
      {
        stop: { type: String, default: '' },
        coordinate: { type: [Number], default: null },
      },
    ],
    zone: { type: String, default: '' },
  },
  { timestamps: true }
);

const LocationBus = mongoose.model('Location_BUS_SCHEMA', Location_Bus_Schema);

// ── Helpers ───────────────────────────────────────────────────────────────────
function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const MONGO_URL = process.env.MONGO_URL;
  if (!MONGO_URL) {
    console.error('❌  MONGO_URL not found in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URL);
  console.log('✅  Connected.\n');

  // ── Step 1: Backup ────────────────────────────────────────────────────────
  console.log('📦  Fetching all buses for backup…');
  const allBuses = await LocationBus.find({}).lean();
  console.log(`    Found ${allBuses.length} bus(es).`);

  const backupDir = path.resolve(__dirname);
  const backupFile = path.join(backupDir, `backup_buses_${timestamp()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(allBuses, null, 2), 'utf8');
  console.log(`✅  Backup saved → ${backupFile}\n`);

  // ── Step 2: Count stops that actually have coordinates ────────────────────
  let totalStopsWithCoords = 0;
  for (const bus of allBuses) {
    for (const stop of bus.stops || []) {
      if (stop.coordinate && stop.coordinate.length > 0) {
        totalStopsWithCoords++;
      }
    }
  }
  console.log(`ℹ️   Stops with coordinates (before clear): ${totalStopsWithCoords}`);

  if (totalStopsWithCoords === 0) {
    console.log('ℹ️   No coordinates to clear. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // ── Step 3: Clear coordinates ─────────────────────────────────────────────
  console.log('🗑️   Clearing coordinates from all stops…');

  let busesUpdated = 0;
  let stopsCleared = 0;

  for (const bus of allBuses) {
    let modified = false;

    const updatedStops = (bus.stops || []).map((stop) => {
      if (stop.coordinate && stop.coordinate.length > 0) {
        stopsCleared++;
        modified = true;
        return { ...stop, coordinate: null };
      }
      return stop;
    });

    if (modified) {
      await LocationBus.updateOne(
        { _id: bus._id },
        { $set: { stops: updatedStops } }
      );
      busesUpdated++;
    }
  }

  console.log(`\n✅  Done!`);
  console.log(`    Buses updated  : ${busesUpdated}`);
  console.log(`    Stops cleared  : ${stopsCleared}`);
  console.log(`    Backup file    : ${backupFile}`);

  await mongoose.disconnect();
  console.log('\n🔌  Disconnected from MongoDB.');
}

main().catch((err) => {
  console.error('❌  Script failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
