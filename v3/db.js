const mongoose = require('mongoose');

const v3db = mongoose.createConnection(process.env.MONGO_URL_V3);

v3db.on('connected', () => console.log('v3 database connected'));
v3db.on('error', (err) => console.error('v3 database connection error:', err));

module.exports = v3db;
