const CustomerAddress = require('../models/customerAddress');

// Get all addresses for a user
const getAllAddresses = async (req, res) => {
  try {
    const addresses = await CustomerAddress.find({ userId: req.user.id }).sort({ isDefault: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new address
const createAddress = async (req, res) => {
  try {
    const { isDefault, ...addressData } = req.body;
    
    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await CustomerAddress.updateMany(
        { userId: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }

    const address = new CustomerAddress({
      ...addressData,
      userId: req.user.id,
      isDefault: isDefault || false
    });

    const newAddress = await address.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an address
const updateAddress = async (req, res) => {
  try {
    const { isDefault, ...updateData } = req.body;
    const address = await CustomerAddress.findOne({ _id: req.params.id, userId: req.user.id });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      await CustomerAddress.updateMany(
        { userId: req.user.id, isDefault: true, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    Object.assign(address, updateData, { isDefault: isDefault || false });
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const address = await CustomerAddress.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set an address as default
const setDefaultAddress = async (req, res) => {
  try {
    const address = await CustomerAddress.findOne({ _id: req.params.id, userId: req.user.id });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other default addresses for this user
    await CustomerAddress.updateMany(
      { userId: req.user.id, isDefault: true, _id: { $ne: req.params.id } },
      { isDefault: false }
    );

    address.isDefault = true;
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}; 