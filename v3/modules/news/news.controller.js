const News = require('./news.model');
const { touchSection } = require('../../shared/touchLastUpdated');
const { paginatedFind } = require('../../shared/pagination');

async function getAllNews(req, res) {
    try {
        const news = await News.find({ isDeleted: { $ne: true } });
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

// Delta sync: send last_updated (and include_deleted=true to also receive tombstones).
async function syncNews(req, res) {
    try {
        res.json(await paginatedFind(News, req.query, {}, null, { softDelete: true }));
    } catch (error) {
        console.error('Error syncing news:', error);
        res.status(500).json({ error: 'Failed to sync news' });
    }
}

async function createNews(req, res) {
    const { image_url, url, news, order } = req.body;
    if (!image_url || !url || !news || !order) {
        return res.status(400).json({ error: 'Image URL, URL, news content and order are required' });
    }
    try {
        const newNews = await News.create(req.body);
        await touchSection('news');
        res.status(201).json({ message: 'News added successfully', news: newNews });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ error: 'Failed to add news' });
    }
}

async function updateNews(req, res) {
    const { id } = req.params;
    try {
        const updatedNews = await News.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedNews) {
            return res.status(404).json({ error: 'News not found' });
        }
        await touchSection('news');
        res.json({ message: 'News updated successfully', news: updatedNews });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
}

async function deleteNews(req, res) {
    const { id } = req.params;
    try {
        // Soft delete: keep the document as a tombstone so delta-syncing clients learn about it.
        const deletedNews = await News.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $set: { isDeleted: true, deletedAt: new Date() } },
            { new: true }
        );
        if (!deletedNews) {
            return res.status(404).json({ error: 'News not found' });
        }
        await touchSection('news');
        res.json({ message: 'News deleted successfully', news: deletedNews });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
}

module.exports = { getAllNews, syncNews, createNews, updateNews, deleteNews };
