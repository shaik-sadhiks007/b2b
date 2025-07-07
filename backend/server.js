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

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            process.env.SECOND_FRONTEND_URL || 'http://localhost:5174',
            'http://www.shopatb2b.com',
            'https://www.shopatb2b.com',
            'http://shopatb2b.com',
            'https://shopatb2b.com',
            'http://business.shopatb2b.com',
            'https://business.shopatb2b.com',
            'http://www.business.shopatb2b.com',
            'https://www.business.shopatb2b.com',
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

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

// Define allowed origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.SECOND_FRONTEND_URL || 'http://localhost:5174',
    'http://www.shopatb2b.com',
    'https://www.shopatb2b.com',
    'http://shopatb2b.com',
    'https://shopatb2b.com',
    'http://business.shopatb2b.com',
    'https://business.shopatb2b.com',
    'http://www.business.shopatb2b.com',
    'https://www.business.shopatb2b.com',
];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

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