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

// Get all menus
exports.getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.find().sort({ date: -1 });
        res.json(menus);
    } catch (error) {
        console.error("Error fetching menus:", error);
        res.status(500).json({ error: "Failed to fetch menus" });
    }
};

// Get menu by date
exports.getMenuByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const menu = await Menu.findOne({ date });
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }
        res.json(menu);
    } catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ error: "Failed to fetch menu" });
    }
};

// Create new menu
exports.createMenu = async (req, res) => {
    try {
        const { date, morning, afternoon, evening } = req.body;

        // Validate required fields
        if (!date) {
            return res.status(400).json({ error: "Date is required" });
        }

        // Check if menu already exists for the date
        const existingMenu = await Menu.findOne({ date });
        if (existingMenu) {
            return res.status(400).json({ error: "Menu already exists for this date" });
        }

        // Create new menu with quantities
        const menu = new Menu({
            date,
            morning: Array.isArray(morning) ? morning.map(item => ({
                menuName: item.menuName,
                image: item.image || "",
                price: item.price,
                quantity: item.quantity || 1
            })) : [],
            afternoon: Array.isArray(afternoon) ? afternoon.map(item => ({
                menuName: item.menuName,
                image: item.image || "",
                price: item.price,
                quantity: item.quantity || 1
            })) : [],
            evening: Array.isArray(evening) ? evening.map(item => ({
                menuName: item.menuName,
                image: item.image || "",
                price: item.price,
                quantity: item.quantity || 1
            })) : []
        });

        // Validate that at least one meal time has items
        if (menu.morning.length === 0 && menu.afternoon.length === 0 && menu.evening.length === 0) {
            return res.status(400).json({ error: "At least one meal time must have menu items" });
        }

        await menu.save();
        res.status(201).json(menu);
    } catch (error) {
        console.error("Error creating menu:", error);
        res.status(500).json({ error: "Failed to create menu" });
    }
};

// Update menu
exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, morning } = req.body;

        // Validate required fields
        if (!date) {
            return res.status(400).json({ error: "Date is required" });
        }

        // Find the menu by ID
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }

        // Check if another menu exists for the same date (excluding current menu)
        const existingMenu = await Menu.findOne({ 
            date, 
            _id: { $ne: id } 
        });
        if (existingMenu) {
            return res.status(400).json({ error: "Menu already exists for this date" });
        }

        // Validate morning array
        if (!Array.isArray(morning)) {
            return res.status(400).json({ error: "Morning menu must be an array" });
        }

        // Validate that morning array is not empty
        if (morning.length === 0) {
            return res.status(400).json({ error: "At least one menu item is required" });
        }

        // Update menu with quantities and validate each item
        menu.date = date;
        menu.morning = morning.map(item => {
            if (!item.menuName || !item.price) {
                throw new Error("Menu name and price are required for each item");
            }
            return {
                menuName: item.menuName,
                image: item.image || "",
                price: item.price,
                quantity: item.quantity || 1
            };
        });

        await menu.save();
        res.status(200).json({ 
            message: "Menu updated successfully",
            menu 
        });
    } catch (error) {
        console.error("Error updating menu:", error);
        if (error.message === "Menu name and price are required for each item") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to update menu" });
    }
};

// Update menu by date
exports.updateMenuByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const { morning, afternoon, evening } = req.body;

        // Validate required fields
        if (!date) {
            return res.status(400).json({ error: "Date is required" });
        }

        // Find the menu by date
        const menu = await Menu.findOne({ date });
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }

        // Validate morning array
        if (!Array.isArray(morning)) {
            return res.status(400).json({ error: "Morning menu must be an array" });
        }

        // Validate that morning array is not empty
        if (morning.length === 0) {
            return res.status(400).json({ error: "At least one menu item is required" });
        }

        // Update menu with quantities and validate each item
        menu.morning = morning.map(item => {
            if (!item.menuName || !item.price) {
                throw new Error("Menu name and price are required for each item");
            }
            return {
                menuName: item.menuName,
                image: item.image || "",
                price: item.price,
                quantity: item.quantity || 1
            };
        });

        // Update afternoon and evening arrays
        menu.afternoon = Array.isArray(afternoon) ? afternoon.map(item => ({
            menuName: item.menuName,
            image: item.image || "",
            price: item.price,
            quantity: item.quantity || 1
        })) : [];

        menu.evening = Array.isArray(evening) ? evening.map(item => ({
            menuName: item.menuName,
            image: item.image || "",
            price: item.price,
            quantity: item.quantity || 1
        })) : [];

        await menu.save();
        res.status(200).json({ 
            message: "Menu updated successfully",
            menu 
        });
    } catch (error) {
        console.error("Error updating menu:", error);
        if (error.message === "Menu name and price are required for each item") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to update menu" });
    }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
    try {
        const { date } = req.params;
        const menu = await Menu.findOneAndDelete({ date });
        if (!menu) {
            return res.status(404).json({ error: "Menu not found" });
        }
        res.json({ message: "Menu deleted successfully" });
    } catch (error) {
        console.error("Error deleting menu:", error);
        res.status(500).json({ error: "Failed to delete menu" });
    }
};
