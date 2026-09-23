/**
 * migrate_to_v3.js
 *
 * One-shot migration from the legacy database (MONGO_URL) into the new v3
 * database (MONGO_URL_V3).
 *
 * 1. Direct collection migrations (old schema fields === v3 schema fields):
 *      about_schemas -> About, news_schemas -> News, team_schemas -> Team,
 *      help_schemas -> Help, admin_schemas -> Admin, event_schemas -> Event
 *    Every doc is upserted by its original _id, so the script is safe to re-run.
 *
 * 2. Buses & stops migration:
 *    Reads the bus backup JSON (backups/backup_buses_*.json — the file produced
 *    by scripts/backup_and_clear_coords.js *before* coordinates were cleared in
 *    the live DB, which is why we read from the backup instead of the old DB).
 *      - Every embedded stop is deduplicated into the v3 `cities` collection.
 *        Stops are deduped by (lowercased name + coordinate), NOT by name alone:
 *        the data contains real same-name stops in different zones/districts
 *        with genuinely different coordinates (e.g. "Kalikapur", "Mecheda"),
 *        so name-only dedup would silently merge distinct physical locations.
 *      - Each bus's `stops` array is rewritten to an ordered list of City
 *        ObjectIds, preserving route order (and repeats, if any).
 *      - Stops with a null/missing coordinate still get a City doc (lat/lng
 *        null) so the stop name isn't lost; see v3/modules/city/city.model.js.
 *      - v3 `lastupdateds.cities` / `.buses` are touched with the current time.
 *
 * Usage:
 *   node scripts/migrate_to_v3.js              # run the full migration
 *   node scripts/migrate_to_v3.js --dry-run     # compute + log, write nothing
 *   node scripts/migrate_to_v3.js --buses-file=backups/backup_buses_X.json
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const BUSES_FILE_ARG = process.argv.find((a) => a.startsWith('--buses-file='));
const BATCH_SIZE = 1000;

// ── Old DB: minimal inline schemas mirroring Model/*.js, bound to their real
//    collection names (confirmed against the live DB) ────────────────────────
const oldConn = mongoose.createConnection(process.env.MONGO_URL);

const OldAbout = oldConn.model('OldAbout', new mongoose.Schema({
    about: { type: String, default: '' },
    version: { type: String, default: '' }
}), 'about_schemas');

const OldNews = oldConn.model('OldNews', new mongoose.Schema({
    image_url: String,
    url: String,
    news: String,
    order: Number
}), 'news_schemas');

const OldTeam = oldConn.model('OldTeam', new mongoose.Schema({
    name: String,
    designation: String,
    image_path: String,
    insta: String,
    facebook: String,
    others: String,
    order: Number
}), 'team_schemas');

const OldHelp = oldConn.model('OldHelp', new mongoose.Schema({
    info: { type: String, default: '' },
    url: { type: String, default: '' }
}), 'help_schemas');

const OldAdmin = oldConn.model('OldAdmin', new mongoose.Schema({
    name: String,
    designation: String,
    image_path: String,
    email_id: String,
    phone: Number,
    main: Boolean
}), 'admin_schemas');

const OldEvent = oldConn.model('OldEvent', new mongoose.Schema({
    name: { type: String, default: '' },
    image_url: { type: String, default: '' },
    url: { type: String, default: '' },
    order: Number,
    expiresAt: { type: Date, default: null }
}), 'event_schemas');

// ── New (v3) models — already bound to MONGO_URL_V3 via v3/db.js ────────────
const v3db = require('../v3/db');
const About = require('../v3/modules/about/about.model');
const News = require('../v3/modules/news/news.model');
const Team = require('../v3/modules/team/team.model');
const Help = require('../v3/modules/help/help.model');
const Admin = require('../v3/modules/admin/admin.model');
const Event = require('../v3/modules/event/event.model');
const City = require('../v3/modules/city/city.model');
const Bus = require('../v3/modules/bus/bus.model');
const LastUpdated = require('../v3/modules/lastUpdated/lastUpdated.model');

async function chunkedBulkWrite(Model, ops, label) {
    if (ops.length === 0) {
        console.log(`  (no ${label} to write)`);
        return;
    }
    if (DRY_RUN) {
        console.log(`  [dry-run] would upsert ${ops.length} ${label}`);
        return;
    }
    let written = 0;
    for (let i = 0; i < ops.length; i += BATCH_SIZE) {
        const batch = ops.slice(i, i + BATCH_SIZE);
        const result = await Model.bulkWrite(batch, { ordered: false });
        written += (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);
    }
    console.log(`  ✅  upserted ${ops.length} ${label}`);
}

function toUpsertOp(doc) {
    const { _id, __v, ...rest } = doc;
    return {
        updateOne: {
            filter: { _id },
            update: { $set: rest, $setOnInsert: { _id } },
            upsert: true
        }
    };
}

// ── 1. Direct collection migrations ──────────────────────────────────────────
async function migrateDirect(OldModel, NewModel, label) {
    console.log(`\n📦  Migrating ${label}...`);
    const docs = await OldModel.find({}).lean();
    console.log(`  found ${docs.length} in old DB`);
    const ops = docs.map(toUpsertOp);
    await chunkedBulkWrite(NewModel, ops, label);
}

// ── 2. Buses & stops migration ───────────────────────────────────────────────
function findBusesBackupFile() {
    if (BUSES_FILE_ARG) {
        return path.resolve(__dirname, '..', BUSES_FILE_ARG.split('=')[1]);
    }
    const backupsDir = path.resolve(__dirname, '../backups');
    const candidates = fs.existsSync(backupsDir)
        ? fs.readdirSync(backupsDir)
            .filter((f) => /^backup_buses.*\.json$/.test(f))
            .map((f) => path.join(backupsDir, f))
        : [];
    if (candidates.length === 0) {
        throw new Error('No backup_buses*.json file found in backups/. Pass --buses-file=<path>.');
    }
    candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return candidates[0];
}

function stopCoordinate(stop) {
    return Array.isArray(stop.coordinate) && stop.coordinate.length === 2 ? stop.coordinate : null;
}

function dedupeKey(name, coordinate) {
    const normalizedName = name.trim().toLowerCase();
    return coordinate ? `${normalizedName}|${coordinate[0]},${coordinate[1]}` : `${normalizedName}|null`;
}

async function migrateBusesAndCities() {
    const busesFile = findBusesBackupFile();
    console.log(`\n🚌  Migrating buses & stops from ${path.relative(process.cwd(), busesFile)}...`);
    const buses = JSON.parse(fs.readFileSync(busesFile, 'utf8'));
    console.log(`  found ${buses.length} buses in backup`);

    // ── Dedupe stops -> cities ───────────────────────────────────────────────
    const cityIdByKey = new Map();
    const cityOps = [];
    let totalStops = 0;

    for (const bus of buses) {
        for (const stop of bus.stops || []) {
            totalStops++;
            const name = (stop.stop || '').trim();
            if (!name) continue;
            const coordinate = stopCoordinate(stop);
            const key = dedupeKey(name, coordinate);
            if (cityIdByKey.has(key)) continue;

            const cityId = new mongoose.Types.ObjectId(stop._id);
            cityIdByKey.set(key, cityId);
            cityOps.push(toUpsertOp({
                _id: cityId,
                name,
                lat: coordinate ? coordinate[0] : null,
                lng: coordinate ? coordinate[1] : null
            }));
        }
    }

    console.log(`  ${totalStops} embedded stops -> ${cityOps.length} unique cities`);
    await chunkedBulkWrite(City, cityOps, 'cities');

    // ── Transform buses: embedded stops -> ordered City ObjectId refs ───────
    const busOps = buses.map((bus) => {
        const stopIds = (bus.stops || [])
            .map((stop) => {
                const name = (stop.stop || '').trim();
                if (!name) return null;
                const key = dedupeKey(name, stopCoordinate(stop));
                return cityIdByKey.get(key) || null;
            })
            .filter(Boolean);

        return toUpsertOp({
            _id: new mongoose.Types.ObjectId(bus._id),
            name: bus.name || '',
            route: bus.route || '',
            status: bus.status || '',
            image_url: bus.image_url || '',
            enable: bus.enable !== false,
            firstservice: bus.firstservice ?? null,
            lastservice: bus.lastservice ?? null,
            zone: bus.zone || '',
            stops: stopIds,
            lastUpdated: new Date()
        });
    });

    await chunkedBulkWrite(Bus, busOps, 'buses');

    if (!DRY_RUN) {
        await LastUpdated.findOneAndUpdate(
            {},
            { $set: { cities: new Date(), buses: new Date() } },
            { upsert: true }
        );
        console.log('  ✅  touched lastUpdated.cities / lastUpdated.buses');
    }
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
    if (!process.env.MONGO_URL) throw new Error('MONGO_URL not set in .env');
    if (!process.env.MONGO_URL_V3) throw new Error('MONGO_URL_V3 not set in .env');

    console.log(DRY_RUN ? '🔎  DRY RUN — no writes will be made\n' : '🚀  Running migration\n');

    console.log('🔌  Connecting to old DB and v3 DB...');
    await oldConn.asPromise();
    await v3db.asPromise();
    console.log('✅  Both connections ready.');

    await migrateDirect(OldAbout, About, 'about');
    await migrateDirect(OldNews, News, 'news');
    await migrateDirect(OldTeam, Team, 'team');
    await migrateDirect(OldHelp, Help, 'helps');
    await migrateDirect(OldAdmin, Admin, 'admins');
    await migrateDirect(OldEvent, Event, 'events');

    await migrateBusesAndCities();

    console.log('\n🎉  Migration complete.');
    await oldConn.close();
    await v3db.close();
}

main().catch((err) => {
    console.error('❌  Migration failed:', err);
    process.exit(1);
});
