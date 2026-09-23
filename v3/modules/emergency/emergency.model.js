const mongoose = require('mongoose');
const v3db = require('../../db');

// Minimal stub shape; refine once the exact emergency-contact fields are decided.
const EmergencySchema = mongoose.Schema({
    title: { type: String, default: '' },
    value: { type: String, default: '' },
    order: Number
}, { timestamps: true });

const Emergency = v3db.model('Emergency', EmergencySchema);

module.exports = Emergency;
