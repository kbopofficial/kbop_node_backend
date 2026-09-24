const Bus = require('./bus.model');
require('../city/city.model'); // ensure City is registered on the v3 connection for populate('stops')
const { paginatedFind } = require('../../shared/pagination');
const { touchSection } = require('../../shared/touchLastUpdated');
const { syncCityZones } = require('../../shared/syncCityZones');

// If a client sends the legacy `zone` without `zones`, derive `zones` from it.
function withZones(body) {
    if (body.zone !== undefined && body.zones === undefined) {
        return { ...body, zones: body.zone ? [String(body.zone)] : [] };
    }
    return body;
}

async function getAllBuses(req, res) {
    try {
        const { zone } = req.query;
        const baseFilter = zone ? { zone } : {};
        const result = await paginatedFind(Bus, req.query, baseFilter, { path: 'stops' });
        res.json(result);
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).json({ error: 'Failed to fetch buses' });
    }
}

async function getBusNames(req, res) {
    try {
        const buses = await Bus.find().select('_id name').lean();
        res.json(buses);
    } catch (error) {
        console.error('Error fetching bus names:', error);
        res.status(500).json({ error: 'Failed to fetch bus names' });
    }
}

async function getBusById(req, res) {
    try {
        const bus = await Bus.findById(req.params.id).populate('stops');
        if (!bus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        console.error('Error fetching bus:', error);
        res.status(500).json({ error: 'Failed to fetch bus' });
    }
}

async function getDisabledBuses(req, res) {
    try {
        const { zone } = req.query;
        const filter = { enable: false };
        if (zone) filter.zone = zone;
        const buses = await Bus.find(filter).populate('stops').lean();
        if (buses.length === 0) {
            return res.status(404).json({ message: 'No disabled buses found.' });
        }
        res.json({ disabledBuses: buses });
    } catch (error) {
        console.error('Error fetching disabled buses:', error);
        res.status(500).json({ error: 'Failed to fetch disabled buses' });
    }
}

async function getBusesViaStop(req, res) {
    const { stop } = req.query;
    if (!stop) {
        return res.status(400).json({ error: 'stop (city id) is required' });
    }
    try {
        const buses = await Bus.find({ stops: stop }).populate('stops').lean();
        if (buses.length === 0) {
            return res.status(404).json({ error: 'No buses found for the given stop' });
        }
        res.json(buses);
    } catch (error) {
        console.error('Error finding buses via stop:', error);
        res.status(500).json({ error: 'Failed to retrieve buses' });
    }
}

async function getBusesFromTo(req, res) {
    const { from, to } = req.query;
    if (!from || !to) {
        return res.status(400).json({ error: 'from and to (city ids) are required' });
    }
    try {
        const buses = await Bus.find({ stops: { $all: [from, to] } }).populate('stops').lean();
        const filteredBuses = buses.filter(bus => {
            const stopIds = bus.stops.map(s => String(s._id));
            const fromIndex = stopIds.indexOf(from);
            const toIndex = stopIds.indexOf(to);
            return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
        });
        res.json(filteredBuses);
    } catch (error) {
        console.error('Error searching buses from-to:', error);
        res.status(500).json({ error: 'Failed to search buses' });
    }
}

async function createBus(req, res) {
    try {
        const newBus = await Bus.create(withZones(req.body));
        await touchSection('buses');
        await syncCityZones(newBus.stops);
        res.status(201).json({ message: true, bus: newBus });
    } catch (error) {
        console.error('Error adding bus:', error);
        res.status(500).json({ error: 'Failed to add bus' });
    }
}

async function updateBus(req, res) {
    const { id } = req.params;
    try {
        const before = await Bus.findById(id).select('stops').lean();
        const updatedBus = await Bus.findByIdAndUpdate(
            id,
            { $set: withZones(req.body) },
            { new: true, runValidators: true }
        );
        if (!updatedBus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        await touchSection('buses');
        await syncCityZones([...(before ? before.stops : []), ...updatedBus.stops]);
        res.json({ message: 'Bus updated', bus: updatedBus });
    } catch (error) {
        console.error('Error updating bus:', error);
        res.status(500).json({ error: 'Failed to update bus' });
    }
}

async function deleteBus(req, res) {
    const { id } = req.params;
    try {
        const deletedBus = await Bus.findByIdAndDelete(id);
        if (!deletedBus) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        await touchSection('buses');
        await syncCityZones(deletedBus.stops);
        res.json({ message: 'Bus deleted successfully' });
    } catch (error) {
        console.error('Error deleting bus:', error);
        res.status(500).json({ error: 'Failed to delete bus' });
    }
}

module.exports = {
    getAllBuses, getBusNames, getBusById, getDisabledBuses,
    getBusesViaStop, getBusesFromTo, createBus, updateBus, deleteBus
};
