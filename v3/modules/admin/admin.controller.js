const Admin = require('./admin.model');

async function getAllAdmins(req, res) {
    try {
        const admins = await Admin.find();
        res.json(admins.length ? admins : 'No admin found');
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
}

async function createAdmin(req, res) {
    const { name, designation, email_id } = req.body;
    if (!name || !designation || !email_id) {
        return res.status(400).json({ error: 'Name, designation, and email ID are required' });
    }
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json({ message: 'Admin added successfully', admin });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ error: 'Failed to add admin' });
    }
}

async function updateAdmin(req, res) {
    const { id } = req.params;
    try {
        const updated = await Admin.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ message: 'Admin updated successfully', admin: updated });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ error: 'Failed to update admin' });
    }
}

async function deleteAdmin(req, res) {
    const { id } = req.params;
    try {
        const deleted = await Admin.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully', admin: deleted });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
}

module.exports = { getAllAdmins, createAdmin, updateAdmin, deleteAdmin };
