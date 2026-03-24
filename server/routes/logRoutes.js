const express = require('express');
const { getLogs, getLog, createLog, deleteLog } = require('../controllers/logController');
const router = express.Router();
router.route('/').get(getLogs).post(createLog);
router.route('/:id').get(getLog).delete(deleteLog);
module.exports = router;
