const mongoose = require('mongoose');
const v3db = require('../../db');

const NewsSchema = mongoose.Schema({
    image_url: String,
    url: String,
    news: String,
    order: Number
}, { timestamps: true });

const News = v3db.model('News', NewsSchema);

module.exports = News;
