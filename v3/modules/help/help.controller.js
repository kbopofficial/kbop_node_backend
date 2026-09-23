const Help = require('./help.model');

async function getHelp(req, res) {
    try {
        const help = await Help.find();
        res.json(help);
    } catch (error) {
        console.error('Error fetching help:', error);
        res.status(500).json({ error: 'Failed to fetch help' });
    }
}

async function createHelp(req, res) {
    const { info, url } = req.body;
    if (!info || !url) {
        return res.status(400).json({ error: 'info and url are required' });
    }
    try {
        const help = await Help.create({ info, url });
        res.status(201).json({ message: 'help created', help });
    } catch (error) {
        console.error('Error creating help:', error);
        res.status(500).json({ error: 'Failed to create help' });
    }
}

async function updateHelp(req, res) {
    const { id } = req.params;
    try {
        const updated = await Help.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'help not found' });
        }
        res.json({ message: 'help updated successfully', help: updated });
    } catch (error) {
        console.error('Error updating help:', error);
        res.status(500).json({ error: 'Failed to update help' });
    }
}

async function deleteHelp(req, res) {
    const { id } = req.params;
    try {
        const deleted = await Help.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'help not found' });
        }
        res.json({ message: 'help deleted successfully', help: deleted });
    } catch (error) {
        console.error('Error deleting help:', error);
        res.status(500).json({ error: 'Failed to delete help' });
    }
}

module.exports = { getHelp, createHelp, updateHelp, deleteHelp };
