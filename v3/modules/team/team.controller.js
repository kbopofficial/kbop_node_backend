const Team = require('./team.model');
const { touchSection } = require('../../shared/touchLastUpdated');

async function getAllTeamMembers(req, res) {
    try {
        const team = await Team.find();
        res.json(team);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
}

async function createTeamMember(req, res) {
    const { name, designation, image_path } = req.body;
    if (!name || !designation || !image_path) {
        return res.status(400).json({ error: 'Missing required member details' });
    }
    try {
        const member = await Team.create(req.body);
        await touchSection('team');
        res.status(201).json({ message: 'New member added successfully', member });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
}

async function updateTeamMember(req, res) {
    const { id } = req.params;
    try {
        const updatedMember = await Team.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        await touchSection('team');
        res.json({ message: 'Team member updated successfully', member: updatedMember });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
}

async function deleteTeamMember(req, res) {
    const { id } = req.params;
    try {
        const deletedMember = await Team.findByIdAndDelete(id);
        if (!deletedMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        await touchSection('team');
        res.json({ message: 'Team member deleted successfully', member: deletedMember });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member' });
    }
}

module.exports = { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
