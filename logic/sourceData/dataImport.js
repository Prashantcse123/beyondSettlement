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

const redshift = new Redshift(clientConfiguration, {rawConnection: true});

const dataImport = {
    importData: () => {
        return new Promise((resolve, reject) => {
            dataImport.connectDb()
                .then(() => dataImport.createTempCreditorVariablesTempTable()) // createTempCreditorVariablesTempTable.sql
                .then(() => dataImport.saveData()) // calls getAllActiveAccounts => selectActiveAccounts.sql
                .then(() => dataImport.disconnectDb())
                .then(() => resolve('Import Success! :)'));
        })
    },

    connectDb: () => {
        console.log('>> Attempting to connect RedShift database');

        return new Promise((resolve, reject) =>
            redshift.connect((err) => {
                if (!err) {
                    dataImport.updateProgress('Data import', -1);
                    console.log('<< RedShift database connected successfully');
                    resolve();
                } else {
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
                    dataImport.updateProgress('Data import', 0);
                    resolve()
                } else {
                    console.log('<< Could not disconnect from RedShift database');
                    reject();
                }
            }));
    },

    createTempCreditorVariablesTempTable: () => {
        const sql = require('./sql/createTempCreditorVariables.sql');

        console.log('>> Attempting to create ##temp_Creditor_Variables temporary table');

        return new Promise((resolve, reject) =>
            redshift.query(sql, {raw: true})
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
            redshift.query(sql, {raw: true})
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

        let promises = [
            new Promise((resolve, reject) =>
                dataImport.getAllActiveAccounts()
                    .then((varData) => {
                        console.log('** Importing Query Finished, Appending Data');
                        models.ImportedActiveAccount.destroy({truncate: true});
                        models.ImportedActiveAccount.bulkCreate(varData).then(() => resolve());
                    }))
        ];

        return new Promise((resolve) =>
            Promise.all(promises).then(resolve()))
    },


    updateProgress: (task, value) => {
        let type = 'Progress';

        models.Progress.findAll({where: {type}}).then(rows => {
            let row = rows[0];

            if (row) {
                row.update({type, task, value});
            } else {
                models.Progress.create({type, task, value});
            }
        });
    }
};

module.exports = dataImport;
