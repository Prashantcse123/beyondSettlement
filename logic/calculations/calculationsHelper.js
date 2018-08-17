const models = require('../../models/index');

const calculationsHelper = {
  calculateAllRows: (calculationsUnit, model, rows, method) => {
    console.log('model', model);
    return new Promise(async (resolve) => {
      const calcRowIndex = (rowIndex) => {
        console.log('Calculating index', rowIndex, rows.length);
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
        await models.sequelize.query('DROP TABLE public."TradelinesStates" CASCADE;')
          .then((users) => {
            console.log('Inside delete');
          });
        /* await models.TradelinesState.destroy({ truncate : true, cascade: true })
                 */
        model.destroy({ truncate: true });
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
