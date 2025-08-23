const express = require('express');
const statusSave = require('./statusHistory');

const router = express.Router();
router.use('/save', statusSave);

module.exports = router;