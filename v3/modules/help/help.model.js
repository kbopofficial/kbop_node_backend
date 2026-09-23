const mongoose = require('mongoose');
const v3db = require('../../db');

const HelpSchema = mongoose.Schema({
    info: { type: String, default: '' },
    url: { type: String, default: '' }
}, { timestamps: true });

const Help = v3db.model('Help', HelpSchema);

module.exports = Help;
