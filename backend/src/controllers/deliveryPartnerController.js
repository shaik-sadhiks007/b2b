const DeliveryPartner = require('../models/deliveryPartnerModel');
const {
  uploadBase64ImageToS3,
  getS3ObjectUrl,
  deleteS3Object
} = require('../utils/awsS3');

const getProfile = async (req, res) => {
  try {
    const partner = req.deliveryPartner;
    // Remove aadhaar object from response
    const { aadhaar, ...profileData } = partner.toObject();
    res.json(profileData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const register = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const partner = new DeliveryPartner({ ...req.body, user: userId });
    await partner.save();
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateStep = async (req, res) => {
  try {
    const partner = req.deliveryPartner;
    if (!partner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }
    const updateData = { ...req.body };
    // Handle photo
    if (updateData.photo && typeof updateData.photo === 'string' && updateData.photo.startsWith('data:image')) {
      // Delete old photo if exists
      if (partner.photo && partner.photo.startsWith('https://')) {
        const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (partner.photo.startsWith(s3UrlPrefix)) {
          const oldKey = partner.photo.replace(s3UrlPrefix, '');
          deleteS3Object(oldKey); // fire-and-forget
        }
      }
      const s3Key = await uploadBase64ImageToS3(updateData.photo, 'delivery-partner');
      updateData.photo = getS3ObjectUrl(s3Key);
    }
    // Handle Aadhaar front
    if (updateData.aadhaar && updateData.aadhaar.front && typeof updateData.aadhaar.front === 'string' && updateData.aadhaar.front.startsWith('data:image')) {
      if (partner.aadhaar && partner.aadhaar.front && partner.aadhaar.front.startsWith('https://')) {
        const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (partner.aadhaar.front.startsWith(s3UrlPrefix)) {
          const oldKey = partner.aadhaar.front.replace(s3UrlPrefix, '');
          deleteS3Object(oldKey);
        }
      }
      const s3Key = await uploadBase64ImageToS3(updateData.aadhaar.front, 'delivery-partner');
      updateData.aadhaar.front = getS3ObjectUrl(s3Key);
    }
    // Handle Aadhaar back
    if (updateData.aadhaar && updateData.aadhaar.back && typeof updateData.aadhaar.back === 'string' && updateData.aadhaar.back.startsWith('data:image')) {
      if (partner.aadhaar && partner.aadhaar.back && partner.aadhaar.back.startsWith('https://')) {
        const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (partner.aadhaar.back.startsWith(s3UrlPrefix)) {
          const oldKey = partner.aadhaar.back.replace(s3UrlPrefix, '');
          deleteS3Object(oldKey);
        }
      }
      const s3Key = await uploadBase64ImageToS3(updateData.aadhaar.back, 'delivery-partner');
      updateData.aadhaar.back = getS3ObjectUrl(s3Key);
    }
    Object.assign(partner, updateData);
    await partner.save();
    res.json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const partner = req.deliveryPartner;
    if (!partner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }
    partner.status = status;
    await partner.save();
    res.json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const toggleOnline = async (req, res) => {
  try {
    const { online } = req.body;
    const partner = req.deliveryPartner;
    if (!partner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }
    partner.online = online;
    await partner.save();
    res.json(partner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const partner = req.deliveryPartner;
    if (!partner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }

    const updateData = { ...req.body };
    
    // Handle photo upload
    if (updateData.photo && typeof updateData.photo === 'string' && updateData.photo.startsWith('data:image')) {
      // Delete old photo if exists
      if (partner.photo && partner.photo.startsWith('https://')) {
        const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (partner.photo.startsWith(s3UrlPrefix)) {
          const oldKey = partner.photo.replace(s3UrlPrefix, '');
          deleteS3Object(oldKey); // fire-and-forget
        }
      }
      const s3Key = await uploadBase64ImageToS3(updateData.photo, 'delivery-partner');
      partner.photo = getS3ObjectUrl(s3Key);
    }
    
    // Update fields directly on the partner document - only update if provided
    if (updateData.name !== undefined) partner.name = updateData.name;
    if (updateData.mobileNumber !== undefined) partner.mobileNumber = updateData.mobileNumber;
    if (updateData.gender !== undefined) partner.gender = updateData.gender;
    if (updateData.vehicleType !== undefined) partner.vehicleType = updateData.vehicleType;
    if (updateData.vehicleNumber !== undefined) partner.vehicleNumber = updateData.vehicleNumber;
    if (updateData.serviceLocation !== undefined) partner.serviceLocation = updateData.serviceLocation;
    
    // Update address - only update if provided
    if (updateData.presentAddress) {
      if (!partner.presentAddress) partner.presentAddress = {};
      if (updateData.presentAddress.streetAddress !== undefined) partner.presentAddress.streetAddress = updateData.presentAddress.streetAddress;
      if (updateData.presentAddress.city !== undefined) partner.presentAddress.city = updateData.presentAddress.city;
      if (updateData.presentAddress.district !== undefined) partner.presentAddress.district = updateData.presentAddress.district;
      if (updateData.presentAddress.state !== undefined) partner.presentAddress.state = updateData.presentAddress.state;
      if (updateData.presentAddress.pinCode !== undefined) partner.presentAddress.pinCode = updateData.presentAddress.pinCode;
    }

    await partner.save();
    
    // Return response without aadhaar
    const { aadhaar, ...profileData } = partner.toObject();
    res.json(profileData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ===== ADMIN FUNCTIONS =====

// Get all delivery partners with pagination and filters (admin only)
const getAllDeliveryPartners = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * pageSize;

    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { serviceLocation: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count
    const total = await DeliveryPartner.countDocuments(query);
    
    // Get delivery partners with pagination
    const deliveryPartners = await DeliveryPartner.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .select('-aadhaar');

    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      deliveryPartners,
      pagination: {
        total,
        totalPages,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    console.error('Error in getAllDeliveryPartners:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lightweight list for dropdowns (admin only)
const getDeliveryPartnerList = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const list = await DeliveryPartner.find(query)
      .select('name mobileNumber status user')
      .populate('user', 'username email')
      .sort({ name: 1 });

    const mapped = list.map((p) => ({
      _id: p._id,
      name: p.name,
      mobileNumber: p.mobileNumber,
      status: p.status,
      user: p.user,
    }));
    res.json({ deliveryPartners: mapped });
  } catch (err) {
    console.error('Error in getDeliveryPartnerList:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get delivery partner by ID (admin only)
const getDeliveryPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryPartner = await DeliveryPartner.findById(id)
      .populate('user', 'username email')

    if (!deliveryPartner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }

    res.json(deliveryPartner);
  } catch (err) {
    console.error('Error in getDeliveryPartnerById:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update delivery partner status (admin only)
const updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['inactive', 'active', 'review', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const deliveryPartner = await DeliveryPartner.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'username email')
    .select('-aadhaar');

    if (!deliveryPartner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }

    res.json(deliveryPartner);
  } catch (err) {
    console.error('Error in updateDeliveryPartnerStatus:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get delivery partner statistics (admin only)
const getDeliveryPartnerStats = async (req, res) => {
  try {
    const total = await DeliveryPartner.countDocuments();
    const active = await DeliveryPartner.countDocuments({ status: 'active' });
    const inactive = await DeliveryPartner.countDocuments({ status: 'inactive' });
    const review = await DeliveryPartner.countDocuments({ status: 'review' });
    const pending = await DeliveryPartner.countDocuments({ status: 'pending' });
    const online = await DeliveryPartner.countDocuments({ online: true });

    res.json({
      total,
      active,
      inactive,
      review,
      pending,
      online
    });
  } catch (err) {
    console.error('Error in getDeliveryPartnerStats:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin: Update delivery partner profile/documents by ID
const updateDeliveryPartnerByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const partner = await DeliveryPartner.findById(id);
    if (!partner) return res.status(404).json({ error: 'Delivery partner not found' });

    // Allow admin to update simple fields and documents
    const updatableFields = [
      'name', 'mobileNumber', 'gender', 'vehicleType', 'vehicleNumber', 'serviceLocation', 'status', 'online'
    ];
    updatableFields.forEach((field) => {
      if (updateData[field] !== undefined) partner[field] = updateData[field];
    });

    // Update presentAddress if provided
    if (updateData.presentAddress) {
      if (!partner.presentAddress) partner.presentAddress = {};
      const addrFields = ['streetAddress','city','district','state','pinCode'];
      addrFields.forEach((f) => {
        if (updateData.presentAddress[f] !== undefined) partner.presentAddress[f] = updateData.presentAddress[f];
      });
    }

    // Update aadhaar object if provided (accept direct URLs)
    if (updateData.aadhaar) {
      if (!partner.aadhaar) partner.aadhaar = {};
      if (updateData.aadhaar.front !== undefined) partner.aadhaar.front = updateData.aadhaar.front;
      if (updateData.aadhaar.back !== undefined) partner.aadhaar.back = updateData.aadhaar.back;
    }

    await partner.save();
    res.json(partner);
  } catch (err) {
    console.error('Error in updateDeliveryPartnerByAdmin:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProfile,
  register,
  updateStep,
  updateStatus,
  toggleOnline,
  getAll,
  updateProfile,
  // Admin functions
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  updateDeliveryPartnerStatus,
  getDeliveryPartnerStats,
  updateDeliveryPartnerByAdmin,
  getDeliveryPartnerList
};