const mongoose = require('mongoose');
const v3db = require('../../db');

const AdminSchema = mongoose.Schema({
    name: String,
    designation: String,
    image_path: String,
    email_id: String,
    phone: Number,
    main: Boolean, // master admin
    local_admin: Boolean,
    community_admin: Boolean
}, { timestamps: true });

const Admin = v3db.model('Admin', AdminSchema);

module.exports = Admin;
