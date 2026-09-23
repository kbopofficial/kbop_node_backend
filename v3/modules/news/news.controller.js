const News = require('./news.model');
const { touchSection } = require('../../shared/touchLastUpdated');

async function getAllNews(req, res) {
    try {
        const news = await News.find();
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
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
        const updatedNews = await News.findByIdAndUpdate(
            id,
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
        const deletedNews = await News.findByIdAndDelete(id);
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

module.exports = { getAllNews, createNews, updateNews, deleteNews };
