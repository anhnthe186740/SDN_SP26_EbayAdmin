const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const DashboardConfig = require('../models/DashboardConfig');
const Log = require('../models/Log');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const ReturnRequest = require('../models/ReturnRequest');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const Statistic = require('../models/Statistic');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Read JSON file
const dbPath = path.join(__dirname, '../../database.json');
const database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();
    await DashboardConfig.deleteMany();
    await Log.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Dispute.deleteMany();
    await ReturnRequest.deleteMany();
    await Notification.deleteMany();
    await Admin.deleteMany();
    await Statistic.deleteMany();

    console.log('Existing data cleared...');

    // Users
    await User.create(database.users);
    // Products
    await Product.create(database.products);
    // Orders
    await Order.create(database.orderTable);
    // OrderItems
    await OrderItem.create(database.orderItem);
    // DashboardConfigs
    await DashboardConfig.create(database.dashboardConfigs);
    // Logs
    await Log.create(database.logs);
    // Coupons
    await Coupon.create(database.Coupons);
    // Reviews
    await Review.create(database.reviews);
    // Disputes
    await Dispute.create(database.disputes);
    // ReturnRequests
    await ReturnRequest.create(database.returnRequests);
    // Notifications
    await Notification.create(database.notifications);
    // Admins
    await Admin.create(database.admins);
    // Statistics
    await Statistic.create(database.statistics);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();
    await DashboardConfig.deleteMany();
    await Log.deleteMany();
    await Coupon.deleteMany();
    await Review.deleteMany();
    await Dispute.deleteMany();
    await ReturnRequest.deleteMany();
    await Notification.deleteMany();
    await Admin.deleteMany();
    await Statistic.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete');
  process.exit();
}
