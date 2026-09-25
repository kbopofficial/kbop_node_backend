const LastUpdated = require('./lastUpdated.model');
const Admin = require('../admin/admin.model');

const NO_ADMIN_ACCESS = { master_admin: false, local_admin: false, community_admin: false };

// Resolves admin flags for the email sent in the `useremail` header; all false when the header is missing or unmatched.
async function resolveAdminAccess(req) {
    const email = String(req.headers['useremail'] || '').trim();
    if (!email) return { ...NO_ADMIN_ACCESS };

    // Case-insensitive exact match; the same email may appear in more than one admin doc, so OR the flags together.
    const admins = await Admin.find({ email_id: email }).collation({ locale: 'en', strength: 2 }).lean();
    return {
        master_admin: admins.some(a => a.main === true),
        local_admin: admins.some(a => a.local_admin === true),
        community_admin: admins.some(a => a.community_admin === true)
    };
}

async function getLastUpdated(req, res) {
    try {
        let doc = await LastUpdated.findOne().lean();
        if (!doc) {
            doc = await LastUpdated.create({});
            doc = doc.toObject();
        }
        res.json({ ...doc, admin: await resolveAdminAccess(req) });
    } catch (error) {
        console.error('Error fetching lastupdated:', error);
        res.status(500).json({ error: 'Failed to fetch lastupdated' });
    }
}

module.exports = { getLastUpdated };
