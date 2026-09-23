const mongoose = require('mongoose');
const v3db = require('../../db');

const CitySchema = mongoose.Schema({
    name: { type: String, required: true },
    // Nullable: some legacy stops were recorded without a geocoded position.
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
}, { timestamps: true });

const City = v3db.model('City', CitySchema);

module.exports = City;
