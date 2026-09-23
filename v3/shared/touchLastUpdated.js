const LastUpdated = require('../modules/lastUpdated/lastUpdated.model');

const SECTIONS = ['cities', 'buses', 'team', 'emergency', 'news', 'about', 'socialLinks'];

async function touchSection(sectionKey) {
    if (!SECTIONS.includes(sectionKey)) {
        throw new Error(`Unknown lastUpdated section: ${sectionKey}`);
    }
    return LastUpdated.findOneAndUpdate(
        {},
        { $set: { [sectionKey]: new Date() } },
        { upsert: true, new: true }
    );
}

module.exports = { touchSection, SECTIONS };
