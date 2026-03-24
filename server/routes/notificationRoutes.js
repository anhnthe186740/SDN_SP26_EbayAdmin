const express = require('express');
const { getNotifications, createNotification } = require('../controllers/notificationController');
const router = express.Router();
router.route('/').get(getNotifications).post(createNotification);
module.exports = router;
