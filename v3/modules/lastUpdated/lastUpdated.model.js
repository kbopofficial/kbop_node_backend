const mongoose = require('mongoose');
const v3db = require('../../db');

// Singleton document: exactly one doc exists, tracking the last write timestamp per app section.
const LastUpdatedSchema = mongoose.Schema({
    cities: { type: Date, default: null },
    buses: { type: Date, default: null },
    team: { type: Date, default: null },
    emergency: { type: Date, default: null },
    news: { type: Date, default: null },
    about: { type: Date, default: null },
    socialLinks: { type: Date, default: null }
});

const LastUpdated = v3db.model('LastUpdated', LastUpdatedSchema);

module.exports = LastUpdated;
