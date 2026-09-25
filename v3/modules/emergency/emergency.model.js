const mongoose = require('mongoose');
const v3db = require('../../db');

// Minimal stub shape; refine once the exact emergency-contact fields are decided.
const EmergencySchema = mongoose.Schema({
    title: { type: String, default: '' },
    value: { type: String, default: '' },
    order: Number,
    // Soft delete: tombstones stay in the collection so delta-syncing clients can evict them.
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const Emergency = v3db.model('Emergency', EmergencySchema);

module.exports = Emergency;
