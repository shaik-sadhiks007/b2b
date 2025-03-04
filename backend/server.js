require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
