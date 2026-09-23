const mongoose = require('mongoose');
const v3db = require('../../db');

const TeamSchema = mongoose.Schema({
    name: String,
    designation: String,
    image_path: String,
    insta: String,
    facebook: String,
    others: String,
    order: Number
}, { timestamps: true });

const Team = v3db.model('Team', TeamSchema);

module.exports = Team;
