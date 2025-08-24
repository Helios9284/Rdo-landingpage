const express = require('express');
const router = express.Router();

const history = require("../controller/statusHistory");
router.post('/statusHistory', history.saveStatusHistory);
router.get('/getHistory', history.getStatusHistory);
router.post('/checkStatusChanges', history.checkStatusChanges);
router.get('/getChangedSubnet', history.getChangedSubnet);

module.exports = router;