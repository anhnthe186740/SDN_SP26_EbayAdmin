const express = require('express');
const { getDisputes, getDispute, createDispute, updateDispute, deleteDispute } = require('../controllers/disputeController');
const router = express.Router();

router.route('/')
  .get(getDisputes)
  .post(createDispute);

router.route('/:id')
  .get(getDispute)
  .put(updateDispute)
  .patch(updateDispute)
  .delete(deleteDispute);

module.exports = router;
