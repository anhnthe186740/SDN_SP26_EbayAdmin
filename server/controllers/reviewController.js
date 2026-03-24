const Review = require('../models/Review');

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ id: req.params.id }) || await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findOne({ id: req.params.id }) || await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    review = await Review.findByIdAndUpdate(review._id, req.body, { new: true, runValidators: true });
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ id: req.params.id }) || await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    await Review.findByIdAndDelete(review._id);
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};
