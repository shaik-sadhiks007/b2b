const CustomerAddress = require('../models/customerAddress');

// Get all addresses for a user
const getAllAddresses = async (req, res) => {
  try {
    const addresses = await CustomerAddress.find({ userId: req.user.id }).sort({ isDefault: -1 });
    res.json(addresses);
  } catch (error) {
    console.error('[customerAddressController.js][getAllAddresses]', error);
    console.trace('[customerAddressController.js][getAllAddresses] Stack trace:');
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
    console.error('[customerAddressController.js][createAddress]', error);
    console.trace('[customerAddressController.js][createAddress] Stack trace:');
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
    console.error('[customerAddressController.js][updateAddress]', error);
    console.trace('[customerAddressController.js][updateAddress] Stack trace:');
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
    console.error('[customerAddressController.js][deleteAddress]', error);
    console.trace('[customerAddressController.js][deleteAddress] Stack trace:');
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
    console.error('[customerAddressController.js][setDefaultAddress]', error);
    console.trace('[customerAddressController.js][setDefaultAddress] Stack trace:');
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