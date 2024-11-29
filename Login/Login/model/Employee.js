const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Employee',
  tableName: 'employee',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    username: {
      type: 'varchar',
    },
    age: {
      type: 'int',
    },
    designation: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
    },
  },
});
