const models = require('../../models/index');

const calculationsHelper = {

    initCache: (calculationsUnit) => {
        // calculationsUnit._cachedColumns = {};
        //
        // Object.keys(calculationsUnit.columns).forEach(columnName => {
        //     let oldFunc = calculationsUnit.columns[columnName];
        //     let newFunc = (account, b, c, d, e, f, g) => {
        //         return new Promise(resolve => {
        //             if (Object.keys(calculationsUnit._cachedColumns).includes(columnName)) {
        //                 resolve(calculationsUnit._cachedColumns[columnName]);
        //             }else{
        //                 oldFunc(account, b, c, d, e, f, g).then(result => {
        //                     calculationsUnit._cachedColumns[columnName] = result;
        //                     resolve(result);
        //                 });
        //             }
        //         });
        //     };
        //
        //     calculationsUnit.columns[columnName] = newFunc;
        // });
        //
        // Object.keys(calculationsUnit.creditorReprocess).forEach(columnName => {
        //     let oldFunc = calculationsUnit.creditorReprocess[columnName];
        //     let newFunc = (account, b, c, d, e, f, g) => {
        //         return new Promise(resolve => {
        //             if (Object.keys(calculationsUnit._cachedCreditorColumns).includes(columnName)) {
        //                 resolve(calculationsUnit._cachedCreditorColumns[columnName]);
        //             }else{
        //                 oldFunc(account, b, c, d, e, f, g).then(result => {
        //                     calculationsUnit._cachedCreditorColumns[columnName] = result;
        //                     resolve(result);
        //                 });
        //             }
        //         });
        //     };
        //
        //     calculationsUnit.creditorReprocess[columnName] = newFunc;
        // });
    },

    calculateAllRows: (calculationsUnit, modelName, rows, method) => {
        let model = models[modelName];

        return new Promise(resolve => {
            let calcRowIndex = (rowIndex) => {
                console.log('Calculating index', rowIndex, rows.length);
                if (rowIndex === rows.length) {
                    resolve();
                    // console.log('bulk ' + method);
                    // if (method === 'create') {
                    //   resolve();
                    //   // model.bulkCreate(calculationsUnit._newRows).then(() => resolve());
                    // }else if (method === 'update') {
                    //   let promises = [];
                    //   rows.forEach(row => {
                    //     let newRow = calculationsUnit._newRows.filter(nr => nr.id === row.id)[0];
                    //     console.log(newRow);
                    //     promises.push(row.update(newRow));
                    //   });
                    //   Promise.all(promises).then(() => resolve());
                    // }
                } else {
                    calculationsUnit._cachedColumns = {};
                    calculationsUnit._rowResults = {};
                    calculationsHelper.calculateRow(calculationsUnit, rows[rowIndex]).then((results) => {
                        if (method === 'create') {
                            // console.log('aaa', results);
                            // console.log('bbb', calculationsUnit.columns);
                            model.create(results).then(() => calcRowIndex(rowIndex + 1));
                        } else if (method === 'update') {
                            rows[rowIndex].update(results).then(() => calcRowIndex(rowIndex + 1));
                        }
                        // calculationsHelper.updateProgress(modelName + ' calculations (' + (rowIndex + 2) + '/' + rows.length + ')', (rowIndex + 2) / rows.length);
                        calculationsHelper.updateProgress(modelName + ' calculations', (rowIndex + 2) / rows.length);
                    });
                }
            };

            if (method === 'create') {
                model.destroy({truncate: true});
            }
            calculationsUnit._newRows = [];
            calcRowIndex(0);
        });
    },

    calculateRow: (calculationsUnit, row) => {
        let promises = Object.keys(calculationsUnit.columns).map(column =>
            calculationsHelper.setCalculationValue(calculationsUnit, row, column));

        return new Promise(resolve => {
            Promise.all(promises).then((resultsColumns) => {
                let resultObj = {};
                resultsColumns.forEach(rc => resultObj[Object.keys(rc)[0]] = rc[Object.keys(rc)[0]]);
                // calculationsUnit._newRows.push(calculationsHelper._rowResults);
                resolve(resultObj);
                // console.log('rr', calculationsUnit._rowResults[row.id])
            });
        });
    },

    setCalculationValue: (calculationsUnit, row, columnName) => {
        return new Promise(resolve =>
        calculationsUnit.columns[columnName](row)
            .then (result => {
                // console.log('mi', columnName, result);
                // if (!calculationsUnit._rowResults[row.id]) calculationsUnit._rowResults[row.id] = {};
                // calculationsUnit._rowResults[row.id][columnName] = result;
                // console.log('rr', calculationsUnit._rowResults[row.id])
                resolve({[columnName]: result})
            })
            .catch(err => console.log('ERROR:', columnName, err)));
    },

    updateProgress: (task, value) => {
        let type = 'Progress';

        if (calculationsHelper._progRow) {
            calculationsHelper._progRow.update({type, task, value});
            return;
        }

        models.Progress.findAll({where: {type}}).then(rows => {
            let row = rows[0];

            if (row) {
                row.update({type, task, value});
            } else {
                models.Progress.create({type, task, value});
            }

            calculationsHelper._progRow = row;
        });
    }
};

module.exports = calculationsHelper;
