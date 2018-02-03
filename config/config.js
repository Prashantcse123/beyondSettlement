module.exports = {
  development: {
    dialect: 'postgres',
    username: 'postgres',
    password: 'pass',
    database: 'beyond_settlements',
    host: 'localhost',
    port: '5433',
  },
  test: {
    dialect: 'postgres',
    username: '',
    password: '',
    database: 'todos_test',
    host: 'db',
    port: '5432',
  },
};
