const Menu = require('../models/menuModel');

// Get today's menu
exports.getTodayMenu = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const menu = await Menu.findOne({ date: today });

        if (!menu) {
            return res.status(404).json({ message: "No menu found for today." });
        }

        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


// get all menus
exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.find();

        if (menus.length === 0) {
            return res.status(404).json({ message: "No menus found." });
        }

        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Get menu by date
exports.getMenuByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const menu = await Menu.findOne({ date });

        if (!menu) {
            return res.status(404).json({ message: "No menu found for this date." });
        }

        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Create a menu
exports.createMenu = async (req, res) => {
    const { date, morning, afternoon, evening } = req.body;

    if (!Array.isArray(morning) || !Array.isArray(afternoon) || !Array.isArray(evening)) {
        return res.status(400).json({ message: "Each meal time must have all menu items." });
    }

    try {
        const existingMenu = await Menu.findOne({ date });

        if (existingMenu) {
            return res.status(400).json({ message: "Menu for this date already exists." });
        }

        const newMenu = new Menu({ date, morning, afternoon, evening });

        await newMenu.save();
        res.status(201).json({ message: "Menu added successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update a menu
exports.updateMenu = async (req, res) => {
    try {
        const { date } = req.params;
        const { morning, afternoon, evening } = req.body;

        const updatedMenu = await Menu.findOneAndUpdate(
            { date },
            { morning, afternoon, evening },
            { new: true } // Returns the updated document
        );

        if (!updatedMenu) {
            return res.status(404).json({ message: "No menu found for this date." });
        }

        res.status(200).json({ message: "Menu updated successfully.", updatedMenu });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a menu
exports.deleteMenu = async (req, res) => {
    try {
        const { date } = req.params;

        const deletedMenu = await Menu.findOneAndDelete({ date });

        if (!deletedMenu) {
            return res.status(404).json({ message: "No menu found for this date." });
        }

        res.status(200).json({ message: "Menu deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
