const mongoose = require('mongoose');
const v3db = require('../../db');

// Minimal stub shape; refine once the exact social-links fields are decided.
const SocialLinkSchema = mongoose.Schema({
    platform: { type: String, default: '' },
    url: { type: String, default: '' },
    order: Number
}, { timestamps: true });

const SocialLink = v3db.model('SocialLink', SocialLinkSchema);

module.exports = SocialLink;
