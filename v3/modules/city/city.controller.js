const City = require('./city.model');
const { paginatedFind } = require('../../shared/pagination');
const { touchSection } = require('../../shared/touchLastUpdated');

async function getAllCities(req, res) {
    try {
        const { zone } = req.query;
        const cities = await City.find(zone ? { zones: zone } : {}).lean();
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
}

async function getAllStops(req, res) {
    try {
        const { zone } = req.query;
        const result = await paginatedFind(City, req.query, zone ? { zones: zone } : {});
        res.json(result);
    } catch (error) {
        console.error('Error fetching stops:', error);
        res.status(500).json({ error: 'Failed to fetch stops' });
    }
}

async function createCity(req, res) {
    const { name, lat, lng, zones } = req.body;
    if (!name || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'name, lat and lng are required' });
    }
    try {
        const city = await City.create({ name, lat, lng, ...(zones !== undefined && { zones }) });
        await touchSection('cities');
        res.status(201).json({ message: 'City created', city });
    } catch (error) {
        console.error('Error creating city:', error);
        res.status(500).json({ error: 'Failed to create city' });
    }
}

async function updateCity(req, res) {
    const { id } = req.params;
    const updateDetails = req.body;
    try {
        const updatedCity = await City.findByIdAndUpdate(
            id,
            { $set: updateDetails },
            { new: true, runValidators: true }
        );
        if (!updatedCity) {
            return res.status(404).json({ error: 'City not found' });
        }
        await touchSection('cities');
        res.json({ message: 'City updated successfully', city: updatedCity });
    } catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ error: 'Failed to update city' });
    }
}

async function deleteCity(req, res) {
    const { id } = req.params;
    try {
        const deletedCity = await City.findByIdAndDelete(id);
        if (!deletedCity) {
            return res.status(404).json({ error: 'City not found' });
        }
        await touchSection('cities');
        res.json({ message: 'City deleted successfully', city: deletedCity });
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({ error: 'Failed to delete city' });
    }
}

module.exports = { getAllCities, getAllStops, createCity, updateCity, deleteCity };
