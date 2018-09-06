module.exports = {
  development: {
    dialect: 'postgres',
    username: 'docker',
    password: 'docker',
    database: 'docker',
    host: 'db',
    port: '5432',
    salesforceAuthProtocol: 'http',
  },
  staging: {
    dialect: 'postgres',
    username: process.env.RDS_DB_USERNAME,
    password: process.env.RDS_DB_PASSWORD,
    database: process.env.RDS_DB_DATABASE,
    host: process.env.RDS_DB_HOSTNAME,
    port: process.env.RDS_DB_PORT,
    salesforceAuthProtocol: 'https',
  },
  production: {
    dialect: 'postgres',
    username: process.env.RDS_DB_USERNAME,
    password: process.env.RDS_DB_PASSWORD,
    database: process.env.RDS_DB_DATABASE,
    host: process.env.RDS_DB_HOSTNAME,
    port: process.env.RDS_DB_PORT,
    salesforceAuthProtocol: 'https',
  },
  test: {
    dialect: 'postgres',
    username: '',
    password: '',
    database: 'todos_test',
    host: 'db',
    port: '5432',
    salesforceAuthProtocol: 'http',
  },
  syncAllFromCrmMinutesInterval: 5,
  syncAllFromCrmRecordsLimit: 250,
  getConfig(varName) {
    return this[process.env.NODE_ENV][varName];
  },
};
