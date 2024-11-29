const { DataSource } = require('typeorm');
const Employee = require('../model/Employee');
const EmployeeQuery=require('../model/EmployeeQuery') 
require('dotenv').config();
const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'bank',
    entities: [Employee,EmployeeQuery],
    synchronize: true,
    //logging: true,
  });
  
module.exports = AppDataSource;
