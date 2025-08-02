const Settings = require('../models/settingsModel');
const { getDistance } = require('geolib');

// Get active admin default settings
const getActiveSettings = async () => {
    try {
        const settings = await Settings.findOne({ 
            settingsType: 'admin_default', 
            isActive: true 
        });
        
        if (!settings) {
            // Return default settings if none exist
            return {
                gstSettings: {
                    defaultGstPercentage: 5,
                    categoryGstPercentages: {
                        pharma: 12,
                        grocery: 2,
                        restaurant: 5,
                        others: 5
                    }
                },
                deliverySettings: {
                    flatDeliveryCharge: 30,
                    deliveryThresholdAmount: 500,
                    freeDeliveryAboveThreshold: true,
                    deliveryRatePerKm: 10,
                    maxDeliveryDistance: 10,
                    additionalChargePerKm: 15,
                    deliveryRatePerKg: 5,
                    maxDeliveryWeight: 15,
                    additionalChargePerKg: 8,
                    minimumOrderAmount: 100
                }
            };
        }
        
        return settings;
    } catch (error) {
        console.error('Error getting active settings:', error);
        throw error;
    }
};

// Calculate delivery charges based on settings and parameters
const calculateDeliveryCharges = async (orderAmount, distance, weight) => {
    try {
        const settings = await getActiveSettings();
        const deliverySettings = settings.deliverySettings;
        
        let deliveryCharge = 0;
        let chargeType = 'flat'; // Default type
        
        // Calculate based on order amount first (threshold logic)
        if (orderAmount >= deliverySettings.deliveryThresholdAmount) {
            if (deliverySettings.freeDeliveryAboveThreshold) {
                deliveryCharge = 0;
                chargeType = 'free';
            } else {
                deliveryCharge = deliverySettings.flatDeliveryCharge;
                chargeType = 'threshold';
            }
        } else {
            // Apply flat charge as base
            deliveryCharge = deliverySettings.flatDeliveryCharge;
            chargeType = 'flat';
        }
        
        // Add distance-based charges if distance is provided
        if (distance && distance > 0) {
            const distanceCharge = distance * deliverySettings.deliveryRatePerKm;
            
            // Additional charges for distance beyond maxDeliveryDistance
            if (distance > deliverySettings.maxDeliveryDistance) {
                const additionalDistance = distance - deliverySettings.maxDeliveryDistance;
                const additionalCharge = additionalDistance * deliverySettings.additionalChargePerKm;
                deliveryCharge += additionalCharge;
            } else {
                deliveryCharge += distanceCharge;
            }
            
            chargeType = 'distance';
        }
        
        // Add weight-based charges if weight is provided
        if (weight && weight > 0) {
            const weightCharge = weight * deliverySettings.deliveryRatePerKg;
            
            // Additional charges for weight beyond maxDeliveryWeight
            if (weight > deliverySettings.maxDeliveryWeight) {
                const additionalWeight = weight - deliverySettings.maxDeliveryWeight;
                const additionalCharge = additionalWeight * deliverySettings.additionalChargePerKg;
                deliveryCharge += additionalCharge;
            } else {
                deliveryCharge += weightCharge;
            }
            
            // Update charge type if both distance and weight are considered
            if (distance && distance > 0) {
                chargeType = 'distance-weight';
            } else {
                chargeType = 'weight';
            }
        }
        
        // Ensure minimum delivery charge
        deliveryCharge = Math.max(deliveryCharge, 0);
        
        return {
            deliveryCharge: Math.round(deliveryCharge * 100) / 100, // Round to 2 decimal places
            chargeType: chargeType
        };
    } catch (error) {
        console.error('Error calculating delivery charges:', error);
        throw error;
    }
};

// Calculate GST based on category and amount
const calculateGST = async (amount, category = 'others') => {
    try {
        const settings = await getActiveSettings();
        const gstSettings = settings.gstSettings;
        
        // Get GST percentage for the category
        let gstPercentage = gstSettings.defaultGstPercentage;
        
        if (category && gstSettings.categoryGstPercentages[category]) {
            gstPercentage = gstSettings.categoryGstPercentages[category];
        }
        
        const gstAmount = (amount * gstPercentage) / 100;
        
        return {
            gstAmount: Math.round(gstAmount * 100) / 100, // Round to 2 decimal places
            gstPercentage: gstPercentage,
            category: category
        };
    } catch (error) {
        console.error('Error calculating GST:', error);
        throw error;
    }
};

// Calculate total checkout charges (for frontend use)
const calculateCheckoutCharges = async (req, res) => {
    try {
        const { 
            orderAmount, 
            distance, 
            weight, 
            category = 'others'
        } = req.body;
        
        if (!orderAmount || orderAmount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order amount is required and must be greater than 0' 
            });
        }
        
        // Calculate delivery charges
        const deliveryResult = await calculateDeliveryCharges(
            orderAmount, 
            distance || 0, 
            weight || 0
        );
        
        // Calculate GST
        const gstResult = await calculateGST(orderAmount, category);
        
        // Calculate total
        const totalAmount = orderAmount + deliveryResult.deliveryCharge + gstResult.gstAmount;
        
        res.json({
            success: true,
            data: {
                subtotalAmount: orderAmount,
                deliveryCharge: deliveryResult.deliveryCharge,
                gstAmount: gstResult.gstAmount,
                gstPercentage: gstResult.gstPercentage,
                category: gstResult.category,
                totalAmount: Math.round(totalAmount * 100) / 100,
                chargeType: deliveryResult.chargeType
            }
        });
    } catch (error) {
        console.error('Error calculating checkout charges:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error calculating checkout charges',
            error: error.message 
        });
    }
};

// Create or update admin default settings
const createOrUpdateSettings = async (req, res) => {
    try {
        const {
            gstSettings,
            deliverySettings
        } = req.body;
        
        // Check if admin default settings already exist
        let settings = await Settings.findOne({ settingsType: 'admin_default' });
        
        if (settings) {
            // Update existing settings
            settings.gstSettings = { ...settings.gstSettings, ...gstSettings };
            settings.deliverySettings = { ...settings.deliverySettings, ...deliverySettings };
            settings.createdBy = req.user.id;
            
            await settings.save();
        } else {
            // Create new settings
            settings = new Settings({
                gstSettings,
                deliverySettings,
                createdBy: req.user.id,
                settingsType: 'admin_default',
                isActive: true
            });
            
            await settings.save();
        }
        
        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error creating/updating settings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating/updating settings',
            error: error.message 
        });
    }
};

// Get current admin default settings
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne({ settingsType: 'admin_default' });
        
        if (!settings) {
            return res.json({
                success: true,
                message: 'No settings found, using defaults',
                data: await getActiveSettings()
            });
        }
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error getting settings',
            error: error.message 
        });
    }
};

// Calculate distance between two points
const calculateDistance = (point1, point2) => {
    try {
        if (!point1 || !point2 || !point1.latitude || !point1.longitude || 
            !point2.latitude || !point2.longitude) {
            return 0;
        }
        
        const distance = getDistance(
            { latitude: point1.latitude, longitude: point1.longitude },
            { latitude: point2.latitude, longitude: point2.longitude }
        );
        
        // Convert meters to kilometers
        return distance / 1000;
    } catch (error) {
        console.error('Error calculating distance:', error);
        return 0;
    }
};

// Direct insert settings (for testing/initial setup)
const insertSettings = async (req, res) => {
    try {
        const {
            gstSettings,
            deliverySettings
        } = req.body;
        
        // Create new settings
        const settings = new Settings({
            gstSettings: gstSettings || {
                defaultGstPercentage: 5,
                categoryGstPercentages: {
                    pharma: 12,
                    grocery: 2,
                    restaurant: 5,
                    others: 5
                }
            },
            deliverySettings: deliverySettings || {
                flatDeliveryCharge: 30,
                deliveryThresholdAmount: 500,
                freeDeliveryAboveThreshold: true,
                deliveryRatePerKm: 10,
                maxDeliveryDistance: 10,
                additionalChargePerKm: 15,
                deliveryRatePerKg: 5,
                maxDeliveryWeight: 15,
                additionalChargePerKg: 8,
                minimumOrderAmount: 100
            },
            createdBy: req.body.createdBy || '507f1f77bcf86cd799439011', // Default ObjectId
            settingsType: 'admin_default',
            isActive: true
        });
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'Settings inserted successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error inserting settings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error inserting settings',
            error: error.message 
        });
    }
};

module.exports = {
    getActiveSettings,
    calculateDeliveryCharges,
    calculateGST,
    calculateCheckoutCharges,
    createOrUpdateSettings,
    getSettings,
    calculateDistance,
    insertSettings
}; 