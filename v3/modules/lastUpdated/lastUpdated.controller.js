const LastUpdated = require('./lastUpdated.model');

async function getLastUpdated(req, res) {
    try {
        let doc = await LastUpdated.findOne().lean();
        if (!doc) {
            doc = await LastUpdated.create({});
            doc = doc.toObject();
        }
        res.json(doc);
    } catch (error) {
        console.error('Error fetching lastupdated:', error);
        res.status(500).json({ error: 'Failed to fetch lastupdated' });
    }
}

module.exports = { getLastUpdated };
