const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/customerAddressController');

// Get all addresses for a user
router.get('/', authMiddleware, getAllAddresses);

// Create a new address
router.post('/', authMiddleware, createAddress);

// Update an address
router.put('/:id', authMiddleware, updateAddress);

// Delete an address
router.delete('/:id', authMiddleware, deleteAddress);

// Set an address as default
router.put('/:id/set-default', authMiddleware, setDefaultAddress);

module.exports = router;
