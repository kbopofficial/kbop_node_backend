const mongoose = require('mongoose');
const v3db = require('../../db');

const AboutSchema = mongoose.Schema({
    about: { type: String, default: '' },
    version: { type: String, default: '' }
}, { timestamps: true });

const About = v3db.model('About', AboutSchema);

module.exports = About;
