const Subdomain = require('../models/subdomainModel');

// GET /resolve-subdomain/:subdomain
const resolveSubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const mapping = await Subdomain.findOne({ subdomain, status: 'active' });
    if (!mapping) return res.status(404).json({ error: 'Not found' });
    res.json({
      category: mapping.businessCategory,
      id: mapping.businessId
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// POST /api/subdomain
const createSubdomain = async (req, res) => {
  try {
    const { businessCategory, businessId, subdomain, status } = req.body;
    const newMapping = await Subdomain.create({
      businessCategory,
      businessId,
      subdomain,
      status: status || 'active'
    });
    res.status(201).json(newMapping);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.subdomain) {
      return res.status(409).json({ error: 'Subdomain already exists' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = { resolveSubdomain, createSubdomain };
