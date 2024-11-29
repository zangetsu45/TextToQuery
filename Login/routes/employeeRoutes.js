const express = require('express');
const employeeController = require('../controller/employeeController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', employeeController.registerEmployee);
router.post('/login', employeeController.loginEmployee);
router.get('/', authenticateToken, employeeController.getAllEmployees);
router.get('/empDetailsByEmail',authenticateToken,employeeController.getEmployeeDetailsFromEmail);
module.exports = router;
