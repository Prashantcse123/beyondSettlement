require('require-sql');

const activeAccountsSql = require('./sql/activeAccounts.sql');
const Redshift = require('node-redshift');

const clientConfiguration = {
  user: process.env.REDSHIFT_USER,
  database: process.env.REDSHIFT_DATABASE,
  password: process.env.REDSHIFT_PASSWORD,
  port: process.env.REDSHIFT_PORT,
  host: process.env.REDSHIFT_HOST,
};

const redshift = new Redshift(clientConfiguration, {rawConnection: true});

const dataImportLogic = {
  importData: () => {
    return new Promise((resolve, reject) => {
      dataImportLogic.connectDb()
        .then(() => dataImportLogic.dropTempCreditorVariablesTempTable())
        .then(() => dataImportLogic.createTempCreditorVariablesTempTable())
        .then(() => dataImportLogic.dropTempCreditorVariablesTempTable())
        .then(() => dataImportLogic.disconnectDb())
        .then(() => resolve('test success!'));
    })
  },

  connectDb: () => {
    console.log('>> Attempting to connect RedShift database');

    return new Promise((resolve, reject) =>
      redshift.connect((err) => {
        if (!err) {
          console.log('<< RedShift database connected successfully');
          resolve();
        }else{
          console.log('<< Could not connect to RedShift database');
          reject();
        }
      }));
  },

  disconnectDb: () => {
    console.log('>> Attempting to disconnect RedShift database');

    return new Promise((resolve, reject) =>
    redshift.close((err) => {
      if (!err) {
        console.log('<< RedShift database disconnected successfully');
        resolve()
      }else{
        console.log('<< Could not disconnect from RedShift database');
        reject();
      }
    }));
  },

  createTempCreditorVariablesTempTable: () => {
    const createTempCreditorVariablesSql = require('./sql/createTempCreditorVariables.sql');

    console.log('>> Attempting to create ##temp_Creditor_Variables temporary table');

    return new Promise((resolve, reject) =>
      redshift.query(createTempCreditorVariablesSql, {raw: true})
        .then((data) => {
          console.log('<< ##temp_Creditor_Variables temporary table created successfully');
          resolve(data);
        })
        .catch((err) => {
          console.log('<< Could not create ##temp_Creditor_Variables temporary table');
          reject(err);
        }));
  },

  dropTempCreditorVariablesTempTable: () => {
    const dropTempCreditorVariablesSql = require('./sql/dropTempCreditorVariables.sql');

    console.log('>> Attempting to drop ##temp_Creditor_Variables temporary table');

    return new Promise((resolve, reject) =>
      redshift.query(dropTempCreditorVariablesSql, {raw: true})
        .then((data) => {
          console.log('<< ##temp_Creditor_Variables temporary table dropped successfully');
          resolve(data);
        })
        .catch((err) => {
          console.log('<< Could not drop ##temp_Creditor_Variables temporary table');
          reject(err);
        }));
  }
};

module.exports = dataImportLogic;
