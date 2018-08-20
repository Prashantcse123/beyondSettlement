const models = require('../../models/index');

const calculationsHelper = {
  calculateAllRows: (calculationsUnit, model, rows, method) => {
    return new Promise((resolve) => {
      const calcRowIndex = (rowIndex) => {
        calculationsHelper.updateProgress('Scorecard calculations', (rowIndex + 1) / rows.length);
        if (rowIndex === rows.length) {
          resolve();
        } else {
          calculationsUnit._cachedColumns = {};
          calculationsUnit._rowResults = {};
          calculationsHelper.calculateRow(calculationsUnit, rows[rowIndex]).then((results) => {
            if (method === 'create') {
              model.create(results).then(() => calcRowIndex(rowIndex + 1));
            } else if (method === 'update') {
              rows[rowIndex].update(results).then(() => calcRowIndex(rowIndex + 1));
            }
          });
        }
      };

      if (method === 'create') {
        models.sequelize.transaction(function(t) {
          var options = { raw: true, transaction: t }
        
          models.sequelize
            .query('SET FOREIGN_KEY_CHECKS = 0', options)
            .then(function() {
              return model.destroy();
            })
            .then(function() {
              return models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
            })
            .then(function() {
              return t.commit()
            })
        }).success(function() {
          // go on here ...
        })
        // model.destroy();
      }

      calculationsUnit._newRows = [];
      calcRowIndex(0);
    });
  },

  calculateRow: (calculationsUnit, row) => {
    const promises = Object.keys(calculationsUnit.columns).map(column =>
      calculationsHelper.setCalculationValue(calculationsUnit, row, column));

    return new Promise((resolve) => {
      Promise.all(promises).then((resultsColumns) => {
        const resultObj = {};

        resultsColumns.forEach(rc => resultObj[Object.keys(rc)[0]] = rc[Object.keys(rc)[0]]);
        resolve(resultObj);
      });
    });
  },

  setCalculationValue: (calculationsUnit, row, columnName) => new Promise(resolve =>
    calculationsUnit.columns[columnName](row)
      .then(result => resolve({ [columnName]: result }))
      .catch(err => console.log('ERROR:', columnName, err))),

  updateProgress: (task, value) => {
    const type = 'Progress';

    if (calculationsHelper._progRow) {
      calculationsHelper._progRow.update({ type, task, value });
      return;
    }

    models.Progress.findAll({ where: { type } }).then((rows) => {
      const row = rows[0];

      if (row) {
        row.update({ type, task, value });
      } else {
        models.Progress.create({ type, task, value });
      }

      calculationsHelper._progRow = row;
    });
  },
};

module.exports = calculationsHelper;
