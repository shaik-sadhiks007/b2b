const Address = require('../models/addressModel');

// Get address
const getAddress = async (req, res) => {
    try {
        const address = await Address.findOne();
        if (!address) {
            return res.status(404).json({ message: 'No address found' });
        }
        res.json(address);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create address
const createAddress = async (req, res) => {
    try {
        const existingAddress = await Address.findOne();
        if (existingAddress) {
            return res.status(400).json({ message: 'Address already exists. Use update instead.' });
        }

        const newAddress = new Address(req.body);
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json(address);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAddress,
    createAddress,
    updateAddress,
    deleteAddress
}; 