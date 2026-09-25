const mongoose = require('mongoose');
const v3db = require('../../db');

const CitySchema = mongoose.Schema({
    name: { type: String, required: true },
    // Nullable: some legacy stops were recorded without a geocoded position.
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    // Zones of every bus that stops here (a city can be shared across zones).
    zones: { type: [String], default: [] },
    // Soft delete: tombstones stay in the collection so delta-syncing clients can evict them.
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const City = v3db.model('City', CitySchema);

module.exports = City;
