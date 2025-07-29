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
    
    // Update form data - only update if provided
    if (updateData.name !== undefined) partner.form.name = updateData.name;
    if (updateData.mobileNumber !== undefined) partner.form.mobileNumber = updateData.mobileNumber;
    if (updateData.gender !== undefined) partner.form.gender = updateData.gender;
    if (updateData.vehicleType !== undefined) partner.form.vehicleType = updateData.vehicleType;
    if (updateData.vehicleNumber !== undefined) partner.form.vehicleNumber = updateData.vehicleNumber;
    if (updateData.serviceLocation !== undefined) partner.form.serviceLocation = updateData.serviceLocation;
    
    // Update address - only update if provided
    if (updateData.presentAddress) {
      if (!partner.form.presentAddress) partner.form.presentAddress = {};
      if (updateData.presentAddress.streetAddress !== undefined) partner.form.presentAddress.streetAddress = updateData.presentAddress.streetAddress;
      if (updateData.presentAddress.city !== undefined) partner.form.presentAddress.city = updateData.presentAddress.city;
      if (updateData.presentAddress.district !== undefined) partner.form.presentAddress.district = updateData.presentAddress.district;
      if (updateData.presentAddress.state !== undefined) partner.form.presentAddress.state = updateData.presentAddress.state;
      if (updateData.presentAddress.pinCode !== undefined) partner.form.presentAddress.pinCode = updateData.presentAddress.pinCode;
    }

    await partner.save();
    
    // Return response without aadhaar
    const { aadhaar, ...profileData } = partner.toObject();
    res.json(profileData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getProfile,
  register,
  updateStep,
  updateStatus,
  toggleOnline,
  getAll,
  updateProfile
};