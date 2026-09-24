const Bus = require('../modules/bus/bus.model');
const City = require('../modules/city/city.model');
const { touchSection } = require('./touchLastUpdated');

// Recomputes City.zones for the given city ids from the buses that currently stop there.
// Only cities whose zones actually changed are written (so delta-sync isn't polluted);
// touches lastUpdated.cities if any changed.
async function syncCityZones(cityIds) {
    const ids = [...new Set((cityIds || []).map(String))];
    if (ids.length === 0) return;

    const [buses, cities] = await Promise.all([
        Bus.find({ stops: { $in: ids } }).select('zone stops').lean(),
        City.find({ _id: { $in: ids } }).select('zones').lean()
    ]);

    const wanted = new Map(ids.map((id) => [id, new Set()]));
    for (const bus of buses) {
        if (!bus.zone) continue;
        for (const stop of bus.stops) {
            const set = wanted.get(String(stop));
            if (set) set.add(bus.zone);
        }
    }

    const ops = [];
    for (const city of cities) {
        const next = [...wanted.get(String(city._id))].sort();
        const current = [...(city.zones || [])].sort();
        if (next.join('|') !== current.join('|')) {
            ops.push({ updateOne: { filter: { _id: city._id }, update: { $set: { zones: next } } } });
        }
    }

    if (ops.length > 0) {
        await City.bulkWrite(ops);
        await touchSection('cities');
    }
}

module.exports = { syncCityZones };
