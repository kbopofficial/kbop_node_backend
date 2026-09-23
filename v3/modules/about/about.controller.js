const About = require('./about.model');
const { touchSection } = require('../../shared/touchLastUpdated');

async function getAbout(req, res) {
    try {
        const about = await About.find();
        res.json(about);
    } catch (error) {
        console.error('Error fetching about:', error);
        res.status(500).json({ error: 'Failed to fetch about' });
    }
}

async function createAbout(req, res) {
    const { about, version } = req.body;
    if (!about || !version) {
        return res.status(400).json({ error: 'about and version are required' });
    }
    try {
        const created = await About.create({ about, version });
        await touchSection('about');
        res.status(201).json({ message: 'about created', about: created });
    } catch (error) {
        console.error('Error creating about:', error);
        res.status(500).json({ error: 'Failed to create about' });
    }
}

async function updateAbout(req, res) {
    const { id } = req.params;
    try {
        const updated = await About.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'about not found' });
        }
        await touchSection('about');
        res.json({ message: 'about updated successfully', about: updated });
    } catch (error) {
        console.error('Error updating about:', error);
        res.status(500).json({ error: 'Failed to update about' });
    }
}

async function deleteAbout(req, res) {
    const { id } = req.params;
    try {
        const deleted = await About.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'about not found' });
        }
        await touchSection('about');
        res.json({ message: 'about deleted successfully', about: deleted });
    } catch (error) {
        console.error('Error deleting about:', error);
        res.status(500).json({ error: 'Failed to delete about' });
    }
}

module.exports = { getAbout, createAbout, updateAbout, deleteAbout };
