module.exports = {
  development: {
    dialect: 'postgres',
    username: 'docker',
    password: 'docker',
    database: 'todos_development',
    host: 'db',
    port: '5432',
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
