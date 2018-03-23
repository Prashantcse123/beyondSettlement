const models = require('../../models/index');

const creditorCalculations = {

  /// External Interface
  setData: () => {
    return new Promise((resolve, reject) =>
      creditorCalculations.importCreditorVariables()
        .then(() =>
          creditorCalculations.calculateAllRows()
            .then (() => resolve('Creditor Calculations Success! :)'))
            .catch(() => resolve('Creditor Calculations Error! :(')))
        );
  },

  importCreditorVariables: () => {
    return new Promise(resolve =>
      models.ImportedCreditorVariable.findAll().then(rawCreditors => {
        creditorCalculations._rawCreditors = rawCreditors;
        resolve();
      }));
  },

  /// Main Loop
  calculateAllRows: () => {
    return new Promise(resolve => {
        models.Creditor.findAll().then(creditors => {
          let promises = [];

          creditors.forEach(creditor =>
            promises.push(creditorCalculations.calculateRow(creditor)));
          Promise.all(promises).then(() => resolve());
        });
      });
    },

  calculateRow: (creditor) => {
    let results = {};
    let promises = Object.keys(creditorCalculations.columns).map(column =>
      creditorCalculations.setCalculationValue(creditor, column, results));

    return new Promise(resolve => {
      Promise.all(promises).then(() =>{
        creditor.update(results).then(() => {
          console.log('Creditor - "' + creditor.name + '"', 'Updated with new calculated results');
          resolve();
        })});
    });
  },

  /// Internal Service Functions
  setCalculationValue:  (creditor, columnName, results) => {
    creditorCalculations.columns[columnName](creditor).then(result => results[columnName] = result)
  },
  rawDataColumnMatch:   (creditor, rawDataColumnName, fallbackValue) => {
    return new Promise((resolve) => {
      let result;
      let rawCreditor = creditorCalculations._rawCreditors.filter(rawCr =>
        rawCr.creditor.toLowerCase() === creditor.name.toLowerCase())[0];

      if (rawCreditor) {
        if (rawCreditor[rawDataColumnName]) {
          result = rawCreditor[rawDataColumnName];
        } else {
          result = -1; // NA
        }
      } else {
        result = fallbackValue;
      }

      resolve(result);
    });
  },

  columns: {

    /// Pre Charge-off Columns
    preAvgPctSettlement:  (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'most_accepted_ratio_pre_charge', 0.6),
    preSettlementTerm:    (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'most_accepted_terms_pre_charge', 6),
    preMinPayment:        (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'min_monthly_pay_pre_charge', 'evenpays'),
    preDataPoints:        (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'total_number_settlements_pre_charge', 'Nil'),

    /// Post Charge-off Columns
    postAvgPctSettlement: (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'most_accepted_ratio_post_charge', 0.6),
    postSettlementTerm:   (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'most_accepted_terms_post_charge', 6),
    postMinPayment:       (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'min_monthly_pay_post_charge', 'evenpays'),
    postDataPoints:       (creditor) => creditorCalculations.rawDataColumnMatch(creditor, 'total_number_settlements_post_charge', 'Nil'),

  }

};

module.exports = creditorCalculations;
