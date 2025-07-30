const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

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
const buninessRoutes = require('./src/routes/businessRoutes');
const customerAddressRoutes = require('./src/routes/customerAddressRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const subdomainRoutes = require('./src/routes/subdomainRoutes');
const deliveryPartnerRoutes = require('./src/routes/deliveryPartnerRoutes');

const app = express();
const server = http.createServer(app);

// Allow all subdomains of shopatb2b.com and localhost development ports
const allowedOriginRegex = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*shopatb2b\.com$/;
const localhostRegex = /^https?:\/\/localhost:(5173|5174|5175|5176)$/;

// Helper function for origin validation
function isAllowedOrigin(origin) {
    return allowedOriginRegex.test(origin) || localhostRegex.test(origin);
}

// CORS options with logging
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOriginRegex.test(origin) || localhostRegex.test(origin)) {
            return callback(null, true);
        }
        console.error(`CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Initialize Socket.IO with same origin check
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (isAllowedOrigin(origin)) {
                return callback(null, true);
            }
            console.error(` Socket.IO CORS blocked origin: ${origin}`);
            return callback('Origin not allowed by Socket.IO CORS', false);
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set('io', io);

// Socket.IO events
io.on('connection', (socket) => {
    console.log(` Socket connected: ${socket.id}`);

    socket.on('newOrder', (orderData) => {
        console.log('🛒 New order received:', orderData);
        io.emit('newOrder', orderData);
    });

    socket.on('orderStatusUpdate', (orderData) => {
        console.log(' Order status update received:', orderData);
        io.emit('orderStatusUpdate', orderData);
    });

    socket.on('deliveryReadyOrder', (orderData) => {
        console.log('🚚 Delivery ready order received:', orderData);
        io.emit('deliveryReadyOrder', orderData);
    });

    socket.on('deliveryPartnerAssigned', (orderData) => {
        console.log('👤 Delivery partner assigned:', orderData);
        io.emit('deliveryPartnerAssigned', orderData);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer-address', customerAddressRoutes);
app.use('/api/restaurants', buninessRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/subdomain', subdomainRoutes);
app.use('/api/delivery-partner', deliveryPartnerRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
