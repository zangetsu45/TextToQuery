const AppDataSource = require('../config/datasource');
const EmployeeQuery = require('../model/EmployeeQuery');

const getEmployeeQueryHistory = async (req, res) => {
  const { id } = req.params; 
  const employeeQueryRepository = AppDataSource.getRepository(EmployeeQuery);
  try {
    const queryHistory = await employeeQueryRepository.find({
      where: { id: id }, 
    });

    if (!queryHistory.length) {
      return res.status(404).json({ message: 'No queries found for this employee' });
    }

    res.status(200).json(queryHistory);
  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(500).json({ error: 'Failed to fetch query history' });
  }
};


const saveEmployeeQuery = async (req, res) => {
  const { id, query } = req.body;
  const employeeQueryRepository = AppDataSource.getRepository(EmployeeQuery);

  try {
    const newQuery = employeeQueryRepository.create({
      id,
      query,
    });

    await employeeQueryRepository.save(newQuery);

    res.status(201).json({ message: 'Query saved successfully', query: newQuery });
  } catch (error) {
    console.error('Error saving query:', error);
    res.status(500).json({ error: 'Failed to save query' });
  }
};

module.exports = {
  getEmployeeQueryHistory,
  saveEmployeeQuery
};
