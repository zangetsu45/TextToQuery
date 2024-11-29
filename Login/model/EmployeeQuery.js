const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'EmployeeQuery',
    tableName: 'EmployeeQuery',
    columns: {
      recordId:{
            type: 'int',
            primary: true,
            generated: true,
      },
      id: {
        type: 'int',
      },
      query: {
        type: 'varchar',
        length: 255,
      },
    },
  });
  