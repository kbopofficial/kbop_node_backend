const Team = require('./team.model');
const { touchSection } = require('../../shared/touchLastUpdated');
const { paginatedFind } = require('../../shared/pagination');

async function getAllTeamMembers(req, res) {
    try {
        const team = await Team.find({ isDeleted: { $ne: true } });
        res.json(team);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
}

// Delta sync: send last_updated (and include_deleted=true to also receive tombstones).
async function syncTeamMembers(req, res) {
    try {
        res.json(await paginatedFind(Team, req.query, {}, null, { softDelete: true }));
    } catch (error) {
        console.error('Error syncing team members:', error);
        res.status(500).json({ error: 'Failed to sync team members' });
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
        const updatedMember = await Team.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
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
        // Soft delete: keep the document as a tombstone so delta-syncing clients learn about it.
        const deletedMember = await Team.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true }
        );
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

module.exports = { getAllTeamMembers, syncTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
