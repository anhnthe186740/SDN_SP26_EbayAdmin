const express = require('express');
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');

const router = express.Router();

router
  .route('/')
  .get(getCoupons)
  .post(createCoupon);

router
  .route('/:id')
  .get(getCoupon)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
