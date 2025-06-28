const path = require('path');
const cloudinary = require('cloudinary').v2;
const Business = require('../models/businessModel');
const geolib = require('geolib');
const { uploadBase64ToCloudinary } = require('../config/cloudinary');
const moment = require('moment-timezone');

// Create new business (Step 1)
const createBusiness = async (req, res) => {
    try {
        const formDataObj = JSON.parse(req.body.formData || '{}');
        const {
            restaurantName,
            serviceType,
            ownerName,
            contact,
            address,
            location,
            sameAsOwnerPhone,
            whatsappUpdates,
            operatingHours,
            description
        } = formDataObj;
        let profileImageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            profileImageUrl = result.secure_url;
        }
        const business = new Business({
            owner: req.user.id,
            restaurantName,
            serviceType,
            ownerName,
            contact: {
                primaryPhone: contact?.primaryPhone || '',
                whatsappNumber: contact?.whatsappNumber || '',
                email: contact?.email || '',
                website: contact?.website || ''
            },
            address,
            location,
            sameAsOwnerPhone,
            whatsappUpdates,
            description,
            operatingHours: {
                defaultOpenTime: operatingHours?.defaultOpenTime || '',
                defaultCloseTime: operatingHours?.defaultCloseTime || '',
                timeSlots: {
                    monday: { isOpen: operatingHours?.timeSlots?.monday?.isOpen || false, openTime: operatingHours?.timeSlots?.monday?.openTime || '', closeTime: operatingHours?.timeSlots?.monday?.closeTime || '' },
                    tuesday: { isOpen: operatingHours?.timeSlots?.tuesday?.isOpen || false, openTime: operatingHours?.timeSlots?.tuesday?.openTime || '', closeTime: operatingHours?.timeSlots?.tuesday?.closeTime || '' },
                    wednesday: { isOpen: operatingHours?.timeSlots?.wednesday?.isOpen || false, openTime: operatingHours?.timeSlots?.wednesday?.openTime || '', closeTime: operatingHours?.timeSlots?.wednesday?.closeTime || '' },
                    thursday: { isOpen: operatingHours?.timeSlots?.thursday?.isOpen || false, openTime: operatingHours?.timeSlots?.thursday?.openTime || '', closeTime: operatingHours?.timeSlots?.thursday?.closeTime || '' },
                    friday: { isOpen: operatingHours?.timeSlots?.friday?.isOpen || false, openTime: operatingHours?.timeSlots?.friday?.openTime || '', closeTime: operatingHours?.timeSlots?.friday?.closeTime || '' },
                    saturday: { isOpen: operatingHours?.timeSlots?.saturday?.isOpen || false, openTime: operatingHours?.timeSlots?.saturday?.openTime || '', closeTime: operatingHours?.timeSlots?.saturday?.closeTime || '' },
                    sunday: { isOpen: operatingHours?.timeSlots?.sunday?.isOpen || false, openTime: operatingHours?.timeSlots?.sunday?.openTime || '', closeTime: operatingHours?.timeSlots?.sunday?.closeTime || '' }
                }
            },
            panDetails: {
                panNumber: '',
                name: '',
                dateOfBirth: '',
                address: ''
            },
            currentStep: 1,
            status: 'draft'
        });
        await business.save();
        res.status(201).json(business);
    } catch (error) {
        console.error('Error creating business:', error);
        res.status(500).json({ message: 'Error creating business', error: error.message });
    }
};

// Update business step
const updateBusinessStep = async (req, res) => {
    try {
        const business = await Business.findOne({
            _id: req.params.id,
            owner: req.user.id
        });
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        const step = parseInt(req.params.step);
        const formDataObj = JSON.parse(req.body.formData || '{}');
        const updateData = { ...formDataObj };
        if (updateData.contact) {
            if (!updateData.contact) {
                updateData.contact = {};
            }
            if (updateData.ownerEmail && !updateData.contact.email) {
                updateData.contact.email = updateData.ownerEmail;
            }
            if (updateData.contact?.primaryPhone && !updateData.contact.primaryPhone) {
                updateData.contact.primaryPhone = updateData.contact?.primaryPhone;
            }
            if (updateData.contact?.whatsappNumber && !updateData.contact.whatsappNumber) {
                updateData.contact.whatsappNumber = updateData.contact?.whatsappNumber;
            }
        }
        if (step === 3) {
            if (!updateData.images) {
                updateData.images = {};
            }
            if (req.files?.profileImage?.[0]) {
                try {
                    const result = await cloudinary.uploader.upload(req.files.profileImage[0].path);
                    updateData.images.profileImage = result.secure_url;
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            } else if (formDataObj.images?.profileImage) {
                try {
                    if (formDataObj.images.profileImage.startsWith('data:image')) {
                        const imageUrl = await uploadBase64ToCloudinary(formDataObj.images.profileImage);
                        if (imageUrl) {
                            updateData.images.profileImage = imageUrl;
                        }
                    } else if (formDataObj.images.profileImage.includes('cloudinary')) {
                        updateData.images.profileImage = formDataObj.images.profileImage;
                    }
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            }
            const optionalImages = ['panCardImage', 'gstImage', 'fssaiImage'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const result = await cloudinary.uploader.upload(req.files[imageType][0].path);
                        updateData.images[imageType] = result.secure_url;
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                } else if (formDataObj.images?.[imageType]) {
                    try {
                        if (formDataObj.images[imageType].startsWith('data:image')) {
                            const imageUrl = await uploadBase64ToCloudinary(formDataObj.images[imageType]);
                            if (imageUrl) {
                                updateData.images[imageType] = imageUrl;
                            }
                        } else if (formDataObj.images[imageType].includes('cloudinary')) {
                            updateData.images[imageType] = formDataObj.images[imageType];
                        }
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                }
            }
            if (!updateData.images.profileImage) {
                return res.status(400).json({ message: 'Profile image is required' });
            }
        }
        updateData.currentStep = step;
        if (step === 4) {
            updateData.termsAccepted = true;
            updateData.status = 'review';
        }
        const updatedBusiness = await Business.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        res.json(updatedBusiness);
    } catch (error) {
        console.error('Error updating business step:', error);
        res.status(500).json({ message: 'Error updating business step', error: error.message });
    }
};

// Get all businesses for the current user
const getMyBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ owner: req.user.id });
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching businesses', error: error.message });
    }
};

// Get business profile
const getBusinessProfile = async (req, res) => {
    try {
        const business = await Business.findById(req.restaurant._id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.json(business);
    } catch (error) {
        console.error('Error getting business profile:', error);
        res.status(500).json({ message: 'Error getting business profile', error: error.message });
    }
};

// Update business profile
const updateBusinessProfile = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.files) {
            if (!updateData.images) {
                updateData.images = {};
            }
            if (req.files.profileImage?.[0]) {
                try {
                    const result = await cloudinary.uploader.upload(req.files.profileImage[0].path);
                    updateData.images.profileImage = result.secure_url;
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            } else if (updateData.images?.profileImage && updateData.images.profileImage.startsWith('data:image')) {
                try {
                    const imageUrl = await uploadBase64ToCloudinary(updateData.images.profileImage);
                    if (imageUrl) {
                        updateData.images.profileImage = imageUrl;
                    }
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            }
            const optionalImages = ['panCardImage', 'gstImage', 'fssaiImage'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const result = await cloudinary.uploader.upload(req.files[imageType][0].path);
                        updateData.images[imageType] = result.secure_url;
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                } else if (updateData.images?.[imageType] && updateData.images[imageType].startsWith('data:image')) {
                    try {
                        const imageUrl = await uploadBase64ToCloudinary(updateData.images[imageType]);
                        if (imageUrl) {
                            updateData.images[imageType] = imageUrl;
                        }
                    } catch (error) {
                        console.error(`Error uploading ${imageType}:`, error);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                }
            }
        }
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        });
        const business = await Business.findByIdAndUpdate(
            req.restaurant._id,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
                select: Object.keys(updateData).join(' ')
            }
        );
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.json(business);
    } catch (error) {
        console.error('Error updating business profile:', error);
        res.status(500).json({ message: 'Error updating business profile', error: error.message });
    }
};

// Get all businesses (public route - no auth required)
const getAllPublicBusinesses = async (req, res) => {
    try {
        const { lat, lng, category } = req.query;
        let query = { status: 'published' };
        if (category && category !== "all") {
            query.$or = [
                { serviceType: category },
                { category: category }
            ];
        }
        const businesses = await Business.find(query)
            .select('restaurantName serviceType images.profileImage description rating location category operatingHours')
            .lean();
        const now = moment().tz('Asia/Kolkata');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.day()];
        const currentTime = now.format('HH:mm');
        const formattedBusinesses = businesses.map(business => {
            let distance = null;
            if (lat && lng && business.location && business.location.lat && business.location.lng) {
                const distanceInMeters = geolib.getDistance(
                    { latitude: parseFloat(lat), longitude: parseFloat(lng) },
                    { latitude: business.location.lat, longitude: business.location.lng }
                );
                distance = distanceInMeters / 1000;
            }
            let isOnline = false;
            let openTime = null;
            let closeTime = null;
            if (business.operatingHours && business.operatingHours.timeSlots) {
                const todaySchedule = business.operatingHours.timeSlots[currentDay];
                if (todaySchedule && todaySchedule.isOpen) {
                    openTime = todaySchedule.openTime;
                    closeTime = todaySchedule.closeTime;
                    const currentTimeMoment = moment(currentTime, 'HH:mm');
                    const openTimeMoment = moment(openTime, 'HH:mm');
                    const closeTimeMoment = moment(closeTime, 'HH:mm');
                    isOnline = currentTimeMoment.isBetween(openTimeMoment, closeTimeMoment, null, '[]');
                }
            }
            return {
                _id: business._id,
                name: business.restaurantName,
                imageUrl: business.images?.profileImage || null,
                description: business.description || '',
                distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
                location: business.location || null,
                serviceType: business.serviceType || '',
                category: business.category || '',
                online: isOnline,
                operatingHours: {
                    openTime: openTime || null,
                    closeTime: closeTime || null
                },
                currentTime: currentTime
            };
        });
        if (lat && lng) {
            const filteredBusinesses = formattedBusinesses.filter(business =>
                business.distance !== null && business.distance <= 50
            );
            filteredBusinesses.sort((a, b) => a.distance - b.distance);
            res.json(filteredBusinesses);
        } else {
            res.json(formattedBusinesses);
        }
    } catch (error) {
        console.error('Error getting public businesses:', error);
        res.status(500).json({ message: 'Error getting businesses', error: error.message });
    }
};

// Get a specific business's public details
const getPublicBusinessById = async (req, res) => {
    try {

        const business = await Business.findOne({
            _id: req.params.id,
            status: 'published'
        }).select('restaurantName images.profileImage description location operatingHours serviceType');
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        let distance = null;
        if (req.query.lat && req.query.lng && business.location && business.location.lat && business.location.lng) {
            const distanceInMeters = geolib.getDistance(
                { latitude: parseFloat(req.query.lat), longitude: parseFloat(req.query.lng) },
                { latitude: business.location.lat, longitude: business.location.lng }
            );
            distance = distanceInMeters / 1000;
        }
        const now = moment().tz('Asia/Kolkata');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.day()];
        const currentTime = now.format('HH:mm');
        let isOnline = false;
        let openTime = null;
        let closeTime = null;
        if (business.operatingHours && business.operatingHours.timeSlots) {
            const todaySchedule = business.operatingHours.timeSlots[currentDay];
            if (todaySchedule && todaySchedule.isOpen) {
                openTime = todaySchedule.openTime;
                closeTime = todaySchedule.closeTime;
                const currentTimeMoment = moment(currentTime, 'HH:mm');
                const openTimeMoment = moment(openTime, 'HH:mm');
                const closeTimeMoment = moment(closeTime, 'HH:mm');
                isOnline = currentTimeMoment.isBetween(openTimeMoment, closeTimeMoment, null, '[]');
            }
        }
        const formattedBusiness = {
            _id: business._id,
            name: business.restaurantName,
            imageUrl: business.images?.profileImage || null,
            description: business.description || '',
            distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
            location: business.location || '',
            online: isOnline,
            serviceType: business.serviceType || '',
            operatingHours: {
                openTime: openTime || business.operatingHours?.defaultOpenTime || null,
                closeTime: closeTime || business.operatingHours?.defaultCloseTime || null
            },
            currentTime: currentTime
        };
        res.json(formattedBusiness);
    } catch (error) {
        console.error('Error getting public business:', error);
        res.status(500).json({ message: 'Error getting business', error: error.message });
    }
};

module.exports = {
    createBusiness,
    updateBusinessStep,
    getMyBusinesses,
    getBusinessProfile,
    updateBusinessProfile,
    getAllPublicBusinesses,
    getPublicBusinessById
};