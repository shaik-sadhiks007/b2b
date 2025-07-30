const Business = require('../models/businessModel');


// implementation using Business model only:
const resolveSubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const business = await Business.findOne({ subdomain });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json({
      category: business.category,
      id: business._id
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get business details by subdomain for footer
const getBusinessBySubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const business = await Business.findOne({ 
      subdomain,
      status: 'published'
    }).select('restaurantName address contact description serviceType');
    
    if (!business) return res.status(404).json({ error: 'Business not found' });
    
    res.json(business);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = { resolveSubdomain, getBusinessBySubdomain };
