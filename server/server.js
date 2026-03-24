const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Route files
const users = require('./routes/userRoutes');
const products = require('./routes/productRoutes');
const orders = require('./routes/orderRoutes');
const coupons = require('./routes/couponRoutes');

// Mount routers
app.use('/api/users', users);
app.use('/api/products', products);
app.use('/api/orderTable', orders); // Match JSON server key
app.use('/api/Coupons', coupons);   // Match JSON server key

// Simple catch-all for other collections to avoid breaking frontend
// In a full implementation, we'd add routes for all 9 collections
app.use('/api/orderItem', require('./routes/orderItemRoutes'));
app.use('/api/dashboardConfigs', require('./routes/dashboardRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/statistics', require('./routes/statisticRoutes'));
app.use('/api/returnRequests', require('./routes/returnRequestRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
