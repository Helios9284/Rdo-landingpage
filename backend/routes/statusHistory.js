const express = require('express');
const router = express.Router();

const history = require("../controller/statusHistory");
router.post('/statusHistory', history.saveStatusHistory);

module.exports = router;