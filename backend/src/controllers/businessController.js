const path = require('path');
const Business = require('../models/businessModel');
const geolib = require('geolib');
const { uploadBase64ImageToS3, getS3ObjectUrl } = require('../utils/awsS3');
const moment = require('moment-timezone');

// Create new business (Step 1)
const createBusiness = async (req, res) => {
    try {
        const formDataObj = JSON.parse(req.body.formData || '{}');
        const {
            name,
            serviceType = 'delivery',
            ownerName,
            contact,
            address,
            location,
            sameAsOwnerPhone,
            whatsappUpdates,
            operatingHours,
            description,
            subdomain,
            panDetails
        } = formDataObj;
        let profileUrl = null;
        if (req.file) {
            // Assume req.file.buffer contains the image buffer
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
            profileUrl = getS3ObjectUrl(s3Key);
        } else if (formDataObj.profile && formDataObj.profile.startsWith('data:image')) {
            const s3Key = await uploadBase64ImageToS3(formDataObj.profile, 'business');
            profileUrl = getS3ObjectUrl(s3Key);
        }
        // Check if subdomain is already taken
        if (subdomain) {
            const existingBusiness = await Business.findOne({ subdomain });
            if (existingBusiness) {
                return res.status(400).json({ 
                    message: 'Subdomain already taken. Please choose a different one.' 
                });
            }
        }

        const business = new Business({
            owner: req.user.id,
            name,
            serviceType: serviceType.toLowerCase(),
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
            subdomain: subdomain || undefined,
            images: { profile: profileUrl },
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
        console.error('[businessController.js][createBusiness]', error);
        console.trace('[businessController.js][createBusiness] Stack trace:');
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
            // Profile image
            if (req.files?.profile?.[0]) {
                try {
                    const file = req.files.profile[0];
                    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
                    updateData.images.profile = getS3ObjectUrl(s3Key);
                } catch (error) {
                    console.error('[businessController.js][updateBusinessStep-profile]', error);
                    console.trace('[businessController.js][updateBusinessStep-profile] Stack trace:');
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            } else if (formDataObj.images?.profile && formDataObj.images.profile.startsWith('data:image')) {
                try {
                    const s3Key = await uploadBase64ImageToS3(formDataObj.images.profile, 'business');
                    updateData.images.profile = getS3ObjectUrl(s3Key);
                } catch (error) {
                    console.error('[businessController.js][updateBusinessStep-profile]', error);
                    console.trace('[businessController.js][updateBusinessStep-profile] Stack trace:');
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            } else if (formDataObj.images?.profile && formDataObj.images.profile.includes('amazonaws.com')) {
                updateData.images.profile = formDataObj.images.profile;
            }
            // Optional images
            const optionalImages = ['panCard', 'gst', 'fssai'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const file = req.files[imageType][0];
                        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                        const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
                        updateData.images[imageType] = getS3ObjectUrl(s3Key);
                    } catch (error) {
                        console.error(`[businessController.js][updateBusinessStep-${imageType}]`, error);
                        console.trace(`[businessController.js][updateBusinessStep-${imageType}] Stack trace:`);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                } else if (formDataObj.images?.[imageType] && formDataObj.images[imageType].startsWith('data:image')) {
                    try {
                        const s3Key = await uploadBase64ImageToS3(formDataObj.images[imageType], 'business');
                        updateData.images[imageType] = getS3ObjectUrl(s3Key);
                    } catch (error) {
                        console.error(`[businessController.js][updateBusinessStep-${imageType}]`, error);
                        console.trace(`[businessController.js][updateBusinessStep-${imageType}] Stack trace:`);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                } else if (formDataObj.images?.[imageType] && formDataObj.images[imageType].includes('amazonaws.com')) {
                    updateData.images[imageType] = formDataObj.images[imageType];
                }
            }
            if (!updateData.images.profile) {
                return res.status(400).json({ message: 'Profile image is required' });
            }
        }
        if (updateData.address) {
            updateData.address = {
                streetAddress: updateData.address.streetAddress || '',
                city: updateData.address.city || '',
                state: updateData.address.state || '',
                country: updateData.address.country || 'india',
                pinCode: updateData.address.pinCode || ''
            };
        }
        updateData.currentStep = step;
        if (step === 2) {
            // Handle subdomain for step 2
            if (updateData.subdomain) {
                // Check if subdomain is already taken by another business
                const existingBusiness = await Business.findOne({ 
                    subdomain: updateData.subdomain,
                    _id: { $ne: req.params.id }
                });
                if (existingBusiness) {
                    return res.status(400).json({ 
                        message: 'Subdomain already taken. Please choose a different one.' 
                    });
                }
            }
        }
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
        console.error('[businessController.js][updateBusinessStep]', error);
        console.trace('[businessController.js][updateBusinessStep] Stack trace:');
        res.status(500).json({ message: 'Error updating business step', error: error.message });
    }
};

// Get all businesses for the current user
const getMyBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find({ owner: req.user.id });
        res.json(businesses);
    } catch (error) {
        console.error('[businessController.js][getMyBusinesses]', error);
        console.trace('[businessController.js][getMyBusinesses] Stack trace:');
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
        console.error('[businessController.js][getBusinessProfile]', error);
        console.trace('[businessController.js][getBusinessProfile] Stack trace:');
        res.status(500).json({ message: 'Error getting business profile', error: error.message });
    }
};

// Update business profile
const updateBusinessProfile = async (req, res) => {
    try {
        const updateData = { ...req.body };
        let oldprofileKey = null;
        let oldprofileUrl = null;
        // Find the existing business to get the old image URL
        const existingBusiness = await Business.findById(req.restaurant._id);
        if (existingBusiness && existingBusiness.images && existingBusiness.images.profile) {
            oldprofileUrl = existingBusiness.images.profile;
        }
        if (req.files) {
            if (!updateData.images) {
                updateData.images = {};
            }
            if (req.files.profile?.[0]) {
                try {
                    const file = req.files.profile[0];
                    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
                    updateData.images.profile = getS3ObjectUrl(s3Key);
                } catch (error) {
                    console.error('[businessController.js][updateBusinessProfile-profile]', error);
                    console.trace('[businessController.js][updateBusinessProfile-profile] Stack trace:');
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            }
            const optionalImages = ['panCard', 'gst', 'fssai'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const file = req.files[imageType][0];
                        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                        const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
                        updateData.images[imageType] = getS3ObjectUrl(s3Key);
                    } catch (error) {
                        console.error(`[businessController.js][updateBusinessProfile-${imageType}]`, error);
                        console.trace(`[businessController.js][updateBusinessProfile-${imageType}] Stack trace:`);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                }
            }
        }
        // Handle base64 image upload even if req.files is not present
        if (updateData.images?.profile && updateData.images.profile.startsWith('data:image')) {
            try {
                const s3Key = await uploadBase64ImageToS3(updateData.images.profile, 'business');
                updateData.images.profile = getS3ObjectUrl(s3Key);
            } catch (error) {
                console.error('[businessController.js][updateBusinessProfile-profile]', error);
                console.trace('[businessController.js][updateBusinessProfile-profile] Stack trace:');
                return res.status(500).json({ message: 'Error uploading profile image' });
            }
        }
        // If a new profile image was uploaded, delete the old S3 object (fire-and-forget)
        if (oldprofileUrl && updateData.images && updateData.images.profile && oldprofileUrl !== updateData.images.profile) {
            const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
            if (oldprofileUrl.startsWith(s3UrlPrefix)) {
                oldprofileKey = oldprofileUrl.replace(s3UrlPrefix, '');
                require('../utils/awsS3').deleteS3Object(oldprofileKey); // don't await
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
        console.error('[businessController.js][updateBusinessProfile]', error);
        console.trace('[businessController.js][updateBusinessProfile] Stack trace:');
        res.status(500).json({ message: 'Error updating business profile', error: error.message });
    }
};

// Get all businesses (public route - no auth required)
const getAllPublicBusinesses = async (req, res) => {
    try {
        const { lat, lng, type } = req.query;
        let query = { status: 'published' };
        if (type && type !== "all") {
            query.$or = [
                { serviceType: type },
                { type: type }
            ];
        }
        const businesses = await Business.find(query)
            .select('name serviceType images.profile description rating location type operatingHours subdomain')
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
                name: business.name,
                imageUrl: business.images?.profile || null,
                description: business.description || '',
                distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
                location: business.location || null,
                serviceType: business.serviceType || '',
                type: business.type || '',
                subdomain: business.subdomain || null,
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
        console.error('[businessController.js][getAllPublicBusinesses]', error);
        console.trace('[businessController.js][getAllPublicBusinesses] Stack trace:');
        res.status(500).json({ message: 'Error getting businesses', error: error.message });
    }
};

// Get a specific business's public details
const getPublicBusinessById = async (req, res) => {
    try {
        const business = await Business.findOne({
            _id: req.params.id,
            status: 'published'
        }).select('name images.profile description location operatingHours serviceType type');
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
            name: business.name,
            imageUrl: business.images?.profile || null,
            description: business.description || '',
            distance: distance !== null ? parseFloat(distance.toFixed(2)) : null,
            location: business.location || '',
            online: isOnline,
            serviceType: business.serviceType || '',
            type: business.type || '',
            operatingHours: {
                openTime: openTime || business.operatingHours?.defaultOpenTime || null,
                closeTime: closeTime || business.operatingHours?.defaultCloseTime || null
            },
            currentTime: currentTime
        };
        res.json(formattedBusiness);
    } catch (error) {
        console.error('[businessController.js][getPublicBusinessById]', error);
        console.trace('[businessController.js][getPublicBusinessById] Stack trace:');
        res.status(500).json({ message: 'Error getting business', error: error.message });
    }
};

// Get all businesses for admin
const getAllBusinessesForAdmin = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, status, search } = req.query;
        const skip = (page - 1) * pageSize;
        
        let query = {};
        
        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Search by restaurant name or owner name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } }
            ];
        }
        
        const businesses = await Business.find(query)
            .populate('owner', 'username email')
            .select('name ownerName serviceType status createdAt currentStep images.profile contact address type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(pageSize))
            .lean();
            
        const total = await Business.countDocuments(query);
        
        const formattedBusinesses = businesses.map(business => ({
            _id: business._id,
            name: business.name,
            ownerName: business.ownerName,
            owner: business.owner,
            serviceType: business.serviceType,
            type: business.type,
            status: business.status,
            currentStep: business.currentStep,
            profile: business.images?.profile,
            contact: business.contact,
            address: business.address,
            createdAt: business.createdAt
        }));
        
        res.json({
            businesses: formattedBusinesses,
            pagination: {
                total,
                totalPages: Math.ceil(total / pageSize),
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (error) {
        console.error('[businessController.js][getAllBusinessesForAdmin]', error);
        console.trace('[businessController.js][getAllBusinessesForAdmin] Stack trace:');
        res.status(500).json({ message: 'Error getting businesses', error: error.message });
    }
};

// Admin: Get business profile by ownerId
const getBusinessProfileByOwnerId = async (req, res) => {
    try {
        // Only admin can access (enforced by middleware)
        const { ownerId } = req.query;
        if (!ownerId) {
            return res.status(400).json({ message: 'ownerId is required' });
        }
        const business = await Business.findOne({ owner: ownerId });
        if (!business) {
            return res.status(404).json({ message: 'Business not found for this owner' });
        }
        res.json(business);
    } catch (error) {
        console.error('[businessController.js][getBusinessProfileByOwnerId]', error);
        res.status(500).json({ message: 'Error getting business profile', error: error.message });
    }
};

// Check subdomain availability
const checkSubdomainAvailability = async (req, res) => {
    try {
        const { subdomain } = req.query;
        
        if (!subdomain) {
            return res.status(400).json({ 
                message: 'Subdomain is required',
                available: false 
            });
        }

        // Check if subdomain is valid (only lowercase letters, numbers, and hyphens)
        const subdomainRegex = /^[a-z0-9-]+$/;
        if (!subdomainRegex.test(subdomain)) {
            return res.status(400).json({ 
                message: 'Subdomain can only contain lowercase letters, numbers, and hyphens',
                available: false 
            });
        }

        // Check if subdomain is already taken
        const existingBusiness = await Business.findOne({ subdomain });
        
        if (existingBusiness) {
            return res.status(200).json({ 
                message: 'Subdomain is already taken',
                available: false 
            });
        }

        res.status(200).json({ 
            message: 'Subdomain is available',
            available: true 
        });
    } catch (error) {
        console.error('[businessController.js][checkSubdomainAvailability]', error);
        console.trace('[businessController.js][checkSubdomainAvailability] Stack trace:');
        res.status(500).json({ 
            message: 'Error checking subdomain availability', 
            error: error.message,
            available: false 
        });
    }
};

// Admin: Update business profile by ownerId
const updateBusinessProfileByOwnerId = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found for this owner' });

        const updateData = { ...req.body };
        let oldprofileKey = null;
        let oldprofileUrl = null;
        // Find the existing business to get the old image URL
        if (business && business.images && business.images.profile) {
            oldprofileUrl = business.images.profile;
        }
        if (req.files) {
            if (!updateData.images) {
                updateData.images = {};
            }
            if (req.files.profile?.[0]) {
                try {
                    const file = req.files.profile[0];
                    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
                    updateData.images.profile = getS3ObjectUrl(s3Key);
                } catch (error) {
                    console.error('[businessController.js][updateBusinessProfileByOwnerId-profile]', error);
                    console.trace('[businessController.js][updateBusinessProfileByOwnerId-profile] Stack trace:');
                    return res.status(500).json({ message: 'Error uploading profile image' });
                }
            }
            const optionalImages = ['panCard', 'gst', 'fssai'];
            for (const imageType of optionalImages) {
                if (req.files?.[imageType]?.[0]) {
                    try {
                        const file = req.files[imageType][0];
                        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                        const s3Key = await uploadBase64ImageToS3(base64Image, 'business');
                        updateData.images[imageType] = getS3ObjectUrl(s3Key);
                    } catch (error) {
                        console.error(`[businessController.js][updateBusinessProfileByOwnerId-${imageType}]`, error);
                        console.trace(`[businessController.js][updateBusinessProfileByOwnerId-${imageType}] Stack trace:`);
                        return res.status(500).json({ message: `Error uploading ${imageType}` });
                    }
                }
            }
        }
        // Handle base64 image upload even if req.files is not present
        if (updateData.images?.profile && updateData.images.profile.startsWith('data:image')) {
            try {
                const s3Key = await uploadBase64ImageToS3(updateData.images.profile, 'business');
                updateData.images.profile = getS3ObjectUrl(s3Key);
            } catch (error) {
                console.error('[businessController.js][updateBusinessProfileByOwnerId-profile]', error);
                console.trace('[businessController.js][updateBusinessProfileByOwnerId-profile] Stack trace:');
                return res.status(500).json({ message: 'Error uploading profile image' });
            }
        }
        const optionalImages = ['panCard', 'gst', 'fssai'];
        for (const imageType of optionalImages) {
            if (updateData.images?.[imageType] && updateData.images[imageType].startsWith('data:image')) {
                try {
                    const s3Key = await uploadBase64ImageToS3(updateData.images[imageType], 'business');
                    updateData.images[imageType] = getS3ObjectUrl(s3Key);
                } catch (error) {
                    console.error(`[businessController.js][updateBusinessProfileByOwnerId-${imageType}]`, error);
                    console.trace(`[businessController.js][updateBusinessProfileByOwnerId-${imageType}] Stack trace:`);
                    return res.status(500).json({ message: `Error uploading ${imageType}` });
                }
            }
        }
        // If a new profile image was uploaded, delete the old S3 object (fire-and-forget)
        if (oldprofileUrl && updateData.images && updateData.images.profile && oldprofileUrl !== updateData.images.profile) {
            const s3UrlPrefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
            if (oldprofileUrl.startsWith(s3UrlPrefix)) {
                oldprofileKey = oldprofileUrl.replace(s3UrlPrefix, '');
                require('../utils/awsS3').deleteS3Object(oldprofileKey); // don't await
            }
        }
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        });
        const updatedBusiness = await Business.findByIdAndUpdate(
            business._id,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
                select: Object.keys(updateData).join(' ')
            }
        );
        if (!updatedBusiness) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.json(updatedBusiness);
    } catch (error) {
        console.error('[businessController.js][updateBusinessProfileByOwnerId]', error);
        console.trace('[businessController.js][updateBusinessProfileByOwnerId] Stack trace:');
        res.status(500).json({ message: 'Error updating business profile', error: error.message });
    }
};

module.exports = {
    createBusiness,
    updateBusinessStep,
    getMyBusinesses,
    getBusinessProfile,
    updateBusinessProfile,
    getAllPublicBusinesses,
    getPublicBusinessById,
    getAllBusinessesForAdmin,
    getBusinessProfileByOwnerId,
    updateBusinessProfileByOwnerId,
    checkSubdomainAvailability
};