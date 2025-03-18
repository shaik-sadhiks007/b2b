const MenuTemplate = require('../models/menuTemplateModel');

// Get all menu templates
const getMenuTemplates = async (req, res) => {
    try {
        const templates = await MenuTemplate.find({});
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new menu template
const createMenuTemplate = async (req, res) => {
    try {
        const template = new MenuTemplate(req.body);
        const savedTemplate = await template.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a menu template
const updateMenuTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTemplate = await MenuTemplate.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        if (!updatedTemplate) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(updatedTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a menu template
const deleteMenuTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTemplate = await MenuTemplate.findByIdAndDelete(id);
        if (!deletedTemplate) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMenuTemplates,
    createMenuTemplate,
    updateMenuTemplate,
    deleteMenuTemplate
}; 