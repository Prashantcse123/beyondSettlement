require('require-sql');

const models = require('../../models/index');
const Redshift = require('node-redshift');

const clientConfiguration = {
  user: process.env.REDSHIFT_USER,
  database: process.env.REDSHIFT_DATABASE,
  password: process.env.REDSHIFT_PASSWORD,
  port: process.env.REDSHIFT_PORT,
  host: process.env.REDSHIFT_HOST,
};

const redshift = new Redshift(clientConfiguration, { rawConnection: true });

const dataImport = {
  importData: () => new Promise((resolve, reject) => {
    dataImport.updateProgress('Data Import', -1)
      .then(() => dataImport.createTempCreditorVariablesTempTable()) // createTempCreditorVariablesTempTable.sql
      .then(() => dataImport.saveData()) // calls getAllActiveAccounts => selectActiveAccounts.sql
      .then(() => dataImport.updateProgress('Data Import', -1))
      .then(() => resolve('Import Success! :)'));
  }),

  updateProgress: (task, value) => {
    const type = 'Progress';
    console.log(`>> updateProgress for ${task} to ${value} outer`);


    return new Promise((resolve, reject) => {
      models.Progress.findAll({ where: { type } }).then((rows) => {
        const row = rows[0];

        if (row) {
          row.update({ type, task, value });
        } else {
          models.Progress.create({ type, task, value });
        }
        resolve();
      });
    });
  },

  createTempCreditorVariablesTempTable: () => {
    const sql = require('./sql/createTempCreditorVariables.sql');

    console.log('>> Attempting to create ##temp_Creditor_Variables temporary table');

    return new Promise((resolve, reject) =>
      redshift.rawQuery(sql, { raw: true })
        .then((data) => {
          console.log('<< ##temp_Creditor_Variables temporary table created successfully');
          resolve(data);
        })
        .catch((err) => {
          console.log('<< Could not create ##temp_Creditor_Variables temporary table');
          reject(err);
        }));
  },

  getAllActiveAccounts: () => {
    const sql = require('./sql/selectActiveAccounts.sql');

    console.log('>> Attempting to select ActiveAccounts data from ##temp_Creditor_Variables table');

    return new Promise((resolve, reject) =>
      redshift.rawQuery(sql, { raw: true })
        .then((data) => {
          console.log('<< ActiveAccounts data selected successfully');
          resolve(data);
        })
        .catch((err) => {
          console.log('<< Could not select ActiveAccounts data from ##temp_Creditor_Variables ');
          reject(err);
        }));
  },

  saveData: () => {
    console.log('** Importing Data from RedShift...');

    const promises = [
      new Promise((resolve, reject) =>
        dataImport.getAllActiveAccounts()
          .then((varData) => {
            console.log('** Importing Query Finished, Appending Data');
            models.ImportedActiveAccount.destroy({ truncate: true });
            models.ImportedActiveAccount.bulkCreate(varData).then(() => resolve());
          })),
    ];

    return new Promise(resolve =>
      Promise.all(promises).then(resolve()));
  },
};

module.exports = dataImport;
