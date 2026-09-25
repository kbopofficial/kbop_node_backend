const mongoose = require('mongoose');
const v3db = require('../../db');

const BusSchema = mongoose.Schema({
    name: { type: String, default: '' },
    route: { type: String, default: '' },
    status: { type: String, default: '' },
    image_url: { type: String, default: '' },
    enable: { type: Boolean, default: true },
    firstservice: { type: Number, default: null },
    lastservice: { type: Number, default: null },
    zone: { type: String, default: '' },
    // Ordered array of City references; array order = stop order along the route.
    stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }],
    lastUpdated: { type: Date, default: null },
    // Soft delete: tombstones stay in the collection so delta-syncing clients can evict them.
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const Bus = v3db.model('Bus', BusSchema);

module.exports = Bus;
