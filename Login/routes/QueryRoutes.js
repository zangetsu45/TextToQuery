const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { getEmployeeQueryHistory,saveEmployeeQuery} = require('../controller/QueryHistoryController');

const router = express.Router();
router.get('/:id', authenticateToken, getEmployeeQueryHistory);
router.post('/', authenticateToken, saveEmployeeQuery);
module.exports = router;
