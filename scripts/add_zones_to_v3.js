/**
 * add_zones_to_v3.js
 *
 * Adds a `zones` array field to every city in the v3 database (buses keep only
 * their single `zone`; any `zones` field left on buses is removed).
 *
 *  - cities.zones = sorted unique zones (taken from the bus backup JSON, matched
 *                   by bus _id) of every bus whose `stops` reference the city
 *                   (bus.stops in v3 are City ObjectIds). Cities that no bus
 *                   references get [].
 *
 * Idempotent: zones is always recomputed and $set, so it is safe to re-run.
 *
 * Usage:
 *   node scripts/add_zones_to_v3.js              # apply
 *   node scripts/add_zones_to_v3.js --dry-run    # compute + log, write nothing
 *   node scripts/add_zones_to_v3.js --buses-file=backups/backup_buses_X.json
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const BUSES_FILE_ARG = process.argv.find((a) => a.startsWith('--buses-file='));
const BATCH_SIZE = 1000;

const v3db = require('../v3/db');
const City = require('../v3/modules/city/city.model');
const Bus = require('../v3/modules/bus/bus.model');

function findBusesBackupFile() {
    if (BUSES_FILE_ARG) return path.resolve(__dirname, '..', BUSES_FILE_ARG.split('=')[1]);
    const dir = path.resolve(__dirname, '../backups');
    const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((f) => /^backup_buses.*\.json$/.test(f)).map((f) => path.join(dir, f))
        : [];
    if (files.length === 0) throw new Error('No backup_buses*.json in backups/. Pass --buses-file=<path>.');
    files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return files[0];
}

async function bulk(Model, ops, label) {
    if (DRY_RUN) return console.log(`  [dry-run] would update ${ops.length} ${label}`);
    let modified = 0;
    for (let i = 0; i < ops.length; i += BATCH_SIZE) {
        const r = await Model.bulkWrite(ops.slice(i, i + BATCH_SIZE), { ordered: false, timestamps: false });
        modified += r.modifiedCount;
    }
    console.log(`  ✅  ${label}: matched ${ops.length}, modified ${modified}`);
}

async function main() {
    if (!process.env.MONGO_URL_V3) throw new Error('MONGO_URL_V3 not set in .env');
    console.log(DRY_RUN ? '🔎  DRY RUN — no writes\n' : '🚀  Adding zones\n');
    await v3db.asPromise();

    const file = findBusesBackupFile();
    console.log(`📂  Backup: ${path.relative(process.cwd(), file)}`);
    const backupBuses = JSON.parse(fs.readFileSync(file, 'utf8'));
    const zoneByBusId = new Map(backupBuses.map((b) => [String(b._id), String(b.zone ?? '').trim()]));

    const buses = await Bus.find({}, { stops: 1 }).lean();
    const cities = await City.find({}, { _id: 1 }).lean();
    console.log(`  v3: ${buses.length} buses, ${cities.length} cities (backup: ${backupBuses.length} buses)`);

    const cityZones = new Map();
    let missingInBackup = 0;

    for (const bus of buses) {
        const id = String(bus._id);
        if (!zoneByBusId.has(id)) missingInBackup++;
        const zone = zoneByBusId.get(id) || '';

        if (!zone) continue;
        for (const cityId of bus.stops || []) {
            const key = String(cityId);
            if (!cityZones.has(key)) cityZones.set(key, new Set());
            cityZones.get(key).add(zone);
        }
    }

    const cityOps = cities.map((c) => ({
        updateOne: {
            filter: { _id: c._id },
            update: { $set: { zones: [...(cityZones.get(String(c._id)) || [])].sort() } }
        }
    }));

    const dist = {};
    for (const c of cityOps) {
        const n = c.updateOne.update.$set.zones.length;
        dist[n] = (dist[n] || 0) + 1;
    }
    console.log(`  buses not found in backup: ${missingInBackup}`);
    console.log(`  cities by number of zones: ${JSON.stringify(dist)}`);

    if (DRY_RUN) {
        console.log('  [dry-run] would $unset zones on buses');
    } else {
        const r = await Bus.collection.updateMany({ zones: { $exists: true } }, { $unset: { zones: '' } });
        console.log(`  ✅  buses: removed zones from ${r.modifiedCount}`);
    }
    await bulk(City, cityOps, 'cities');

    await v3db.close();
    console.log('\n🎉  Done.');
}

main().catch((e) => { console.error('❌  Failed:', e); process.exit(1); });
