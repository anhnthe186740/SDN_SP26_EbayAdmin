const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (err) { next(err); }
};

exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) { next(err); }
};
