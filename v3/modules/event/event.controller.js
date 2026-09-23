const Event = require('./event.model');

async function getAllEvents(req, res) {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}

async function createEvent(req, res) {
    const { name, url, image_url, order, expiresAt } = req.body;
    if (!name || !url || !image_url) {
        return res.status(400).json({ error: 'Name, URL, or image URL are required' });
    }
    try {
        const event = await Event.create({
            name,
            image_url,
            url,
            order,
            expiresAt: expiresAt != null ? new Date(expiresAt) : null
        });
        res.status(201).json({ message: 'Event created with expiration timer', event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
}

async function updateEvent(req, res) {
    const { id } = req.params;
    try {
        const updated = await Event.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'event not found' });
        }
        res.json({ message: 'event updated successfully', event: updated });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
}

async function deleteEvent(req, res) {
    const { id } = req.params;
    try {
        const deleted = await Event.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'event not found' });
        }
        res.json({ message: 'event deleted successfully', event: deleted });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
}

module.exports = { getAllEvents, createEvent, updateEvent, deleteEvent };
