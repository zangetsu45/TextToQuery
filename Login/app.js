const express = require('express');
const AppDataSource = require('./config/datasource'); 
const employeeRoutes = require('./routes/employeeRoutes');
const queryRoutes = require('./routes/QueryRoutes')
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established!');


    app.use('/employees', employeeRoutes);
    app.use('/query',queryRoutes)
    // Default Route
    app.get('/', (req, res) => {
      res.send('Welcome to the Employee Management API!');
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
