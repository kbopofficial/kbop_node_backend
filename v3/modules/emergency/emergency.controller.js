const Emergency = require('./emergency.model');
const { touchSection } = require('../../shared/touchLastUpdated');

async function getAllEmergency(req, res) {
    try {
        const items = await Emergency.find();
        res.json(items);
    } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        res.status(500).json({ error: 'Failed to fetch emergency contacts' });
    }
}

async function createEmergency(req, res) {
    const { title, value } = req.body;
    if (!title || !value) {
        return res.status(400).json({ error: 'title and value are required' });
    }
    try {
        const item = await Emergency.create(req.body);
        await touchSection('emergency');
        res.status(201).json({ message: 'Emergency contact added', item });
    } catch (error) {
        console.error('Error adding emergency contact:', error);
        res.status(500).json({ error: 'Failed to add emergency contact' });
    }
}

async function updateEmergency(req, res) {
    const { id } = req.params;
    try {
        const updated = await Emergency.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Emergency contact not found' });
        }
        await touchSection('emergency');
        res.json({ message: 'Emergency contact updated', item: updated });
    } catch (error) {
        console.error('Error updating emergency contact:', error);
        res.status(500).json({ error: 'Failed to update emergency contact' });
    }
}

async function deleteEmergency(req, res) {
    const { id } = req.params;
    try {
        const deleted = await Emergency.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Emergency contact not found' });
        }
        await touchSection('emergency');
        res.json({ message: 'Emergency contact deleted', item: deleted });
    } catch (error) {
        console.error('Error deleting emergency contact:', error);
        res.status(500).json({ error: 'Failed to delete emergency contact' });
    }
}

module.exports = { getAllEmergency, createEmergency, updateEmergency, deleteEmergency };
