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
                .then(() => dataImport.dropTempCreditorVariablesTempTable())
                .then(() => dataImport.createTempCreditorVariablesTempTable())
                .then(() => dataImport.saveData())
                .then(() => dataImport.dropTempCreditorVariablesTempTable())
                .then(() => dataImport.disconnectDb())
                .then(() => resolve('Import Success! :)'));
        })
    },

    connectDb: () => {
        console.log('>> Attempting to connect RedShift database');

        return new Promise((resolve, reject) =>
            redshift.connect((err) => {
                if (!err) {
                    dataImport.updateProgress('Data import', 0.0111222333);
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

    dropTempCreditorVariablesTempTable: () => {
        const sql = require('./sql/dropTempCreditorVariables.sql');

        console.log('>> Attempting to drop ##temp_Creditor_Variables temporary table');

        return new Promise((resolve, reject) =>
            redshift.query(sql, {raw: true})
                .then((data) => {
                    console.log('<< ##temp_Creditor_Variables temporary table dropped successfully');
                    resolve(data);
                })
                .catch((err) => {
                    console.log('<< Could not drop ##temp_Creditor_Variables temporary table');
                    reject(err);
                }));
    },


    getAllCreditorVariables: () => {
        const sql = require('./sql/selectCreditorVariables.sql');

        console.log('>> Attempting to select data from ##temp_Creditor_Variables table');

        return new Promise((resolve, reject) =>
            redshift.query(sql, {raw: true})
                .then((data) => {
                    console.log('<< ##temp_Creditor_Variables data selected successfully');
                    resolve(data);
                })
                .catch((err) => {
                    console.log('<< Could not select data from ##temp_Creditor_Variables ');
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
            // new Promise((resolve, reject) =>
            //     dataImport.getAllCreditorVariables()
            //         .then((varData) => {
            //             models.ImportedCreditorVariable.destroy({truncate: true});
            //             models.ImportedCreditorVariable.bulkCreate(varData).then(() => resolve());
            //             // varData.forEach(d => {
            //             //     models.ImportedCreditorVariable.create(d);
            //             //     resolve();
            //             // });
            //         })),
            new Promise((resolve, reject) =>
                dataImport.getAllActiveAccounts()
                    .then((varData) => {
                        models.ImportedActiveAccount.destroy({truncate: true});
                        models.ImportedActiveAccount.bulkCreate(varData).then(() => resolve());
                        // varData.forEach(d => {
                        //     // dataImport.updateProgress('Accounts import', (varData.indexOf(d) + 1) / varData.length);
                        //     models.ImportedActiveAccount.create(d);
                        //     resolve();
                        // });
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

// saveData: () => {
//   console.log('** Importing Data from RedShift...');
//
//   var promises = [
//     new Promise((resolve, reject) =>
//       // models.Creditor.findAll()
//       //   .then((crData) => {
//       //     crData.forEach(rec => console.log(rec));
//       //     dataImport.getAllCreditorVariables()
//       //   })
//       //   .then((varData) => {
//       //     varData.forEach(rec => console.log(rec));
//       //     resolve(true);
//       //   })
//       dataImport.getAllCreditorVariables()
//         .then((varData) =>
//           varData.forEach(d =>
//             models.ImportedCreditorVariable.create(d))));
// }


module.exports = dataImport;
