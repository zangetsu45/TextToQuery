const AppDataSource = require('../config/datasource');
const Employee = require('../model/Employee'); 
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-key';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerEmployee = async (req, res) => {
    const { username, age, designation, email, password } = req.body;
    const employeeRepository = AppDataSource.getRepository(Employee);
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash password
      const newEmployee = employeeRepository.create({
        username,
        age,
        designation,
        email,
        password: hashedPassword,
      });
      const savedEmployee = await employeeRepository.save(newEmployee);
      res.status(201).json(savedEmployee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to register employee' });
    }
  };

  const loginEmployee = async (req, res) => {
    const { email, password } = req.body;
    const employeeRepository = AppDataSource.getRepository(Employee);
  
    try {
      const employee = await employeeRepository.findOneBy({ email });
      if (!employee) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: employee.id, email: employee.email }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to login' });
    }
  };

  const getAllEmployees = async (req, res) => {
    const employeeRepository = AppDataSource.getRepository(Employee);
  
    try {
      const employees = await employeeRepository.find();
      res.status(200).json(employees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  };
  const getEmployeeDetailsFromEmail = async (req, res) => {
    const { email } = req.query; 
    const employeeRepository = AppDataSource.getRepository(Employee);
    console.log('Received email:', email);

    try {
      const employee = await employeeRepository.findOneBy({ email });
      console.log(employee); 
  
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(200).json(employee); 
    } catch (error) {
      console.error('Error fetching employee details:', error);
      res.status(500).json({ error: 'Failed to fetch employee details' });
    }
  };
  

  module.exports = {
    registerEmployee,
    loginEmployee,
    getAllEmployees,
    getEmployeeDetailsFromEmail
  };