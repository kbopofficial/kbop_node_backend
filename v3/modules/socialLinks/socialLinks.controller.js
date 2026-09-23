const SocialLink = require('./socialLinks.model');
const { touchSection } = require('../../shared/touchLastUpdated');

async function getAllSocialLinks(req, res) {
    try {
        const links = await SocialLink.find();
        res.json(links);
    } catch (error) {
        console.error('Error fetching social links:', error);
        res.status(500).json({ error: 'Failed to fetch social links' });
    }
}

async function createSocialLink(req, res) {
    const { platform, url } = req.body;
    if (!platform || !url) {
        return res.status(400).json({ error: 'platform and url are required' });
    }
    try {
        const link = await SocialLink.create(req.body);
        await touchSection('socialLinks');
        res.status(201).json({ message: 'Social link added', link });
    } catch (error) {
        console.error('Error adding social link:', error);
        res.status(500).json({ error: 'Failed to add social link' });
    }
}

async function updateSocialLink(req, res) {
    const { id } = req.params;
    try {
        const updated = await SocialLink.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Social link not found' });
        }
        await touchSection('socialLinks');
        res.json({ message: 'Social link updated', link: updated });
    } catch (error) {
        console.error('Error updating social link:', error);
        res.status(500).json({ error: 'Failed to update social link' });
    }
}

async function deleteSocialLink(req, res) {
    const { id } = req.params;
    try {
        const deleted = await SocialLink.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Social link not found' });
        }
        await touchSection('socialLinks');
        res.json({ message: 'Social link deleted', link: deleted });
    } catch (error) {
        console.error('Error deleting social link:', error);
        res.status(500).json({ error: 'Failed to delete social link' });
    }
}

module.exports = { getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink };
