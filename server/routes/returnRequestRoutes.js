const express = require('express');
const { getReturnRequests, getReturnRequest, createReturnRequest, updateReturnRequest } = require('../controllers/returnRequestController');
const router = express.Router();

router.route('/')
  .get(getReturnRequests)
  .post(createReturnRequest);

router.route('/:id')
  .get(getReturnRequest)
  .put(updateReturnRequest)
  .patch(updateReturnRequest);

module.exports = router;
