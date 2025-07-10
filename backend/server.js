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


const app = express();
const server = http.createServer(app);

// Allow all subdomains of shopatb2b.com
const allowedOriginRegex = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*shopatb2b\.com$/;

// Helper to check allowed origins for Socket.IO
function isAllowedOrigin(origin) {
    return allowedOriginRegex.test(origin);
}

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOriginRegex.test(origin)) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (isAllowedOrigin(origin)) {
                return callback(null, true);
            }
            return callback('Origin not allowed by Socket.IO CORS', false);
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set('io', io);
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('newOrder', (orderData) => {
        console.log('New order received:', orderData);
        io.emit('newOrder', orderData);
    });

    socket.on('orderStatusUpdate', (orderData) => {
        console.log('Order status update received:', orderData);
        // Broadcast to all connected clients
        io.emit('orderStatusUpdate', orderData);
        console.log('Order status update broadcasted to all clients');
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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 