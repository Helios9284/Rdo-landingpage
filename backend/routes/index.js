const express = require('express');
const statusHistory = require('./statusHistory');

const router = express.Router();
router.use('/save', statusHistory);

module.exports = router;