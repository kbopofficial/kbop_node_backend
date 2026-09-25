const mongoose = require('mongoose');
const v3db = require('../../db');

const NewsSchema = mongoose.Schema({
    image_url: String,
    url: String,
    news: String,
    order: Number,
    // Soft delete: tombstones stay in the collection so delta-syncing clients can evict them.
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

const News = v3db.model('News', NewsSchema);

module.exports = News;
