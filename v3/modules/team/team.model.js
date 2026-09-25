const mongoose = require('mongoose');
const v3db = require('../../db');

const TeamSchema = mongoose.Schema({
    name: String,
    designation: String,
    image_path: String,
    insta: String,
    facebook: String,
    others: String,
    order: Number,
    // Soft delete: tombstones stay in the collection so delta-syncing clients can evict them.
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const Team = v3db.model('Team', TeamSchema);

module.exports = Team;
