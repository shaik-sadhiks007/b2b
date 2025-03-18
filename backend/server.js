const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require('express-fileupload');

// Load environment variables
dotenv.config();

// Validate essential environment variables
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in environment variables');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const menuTemplateRoutes = require('./src/routes/menuTemplateRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/menu-templates', menuTemplateRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
