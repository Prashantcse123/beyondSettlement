const db = require('../../models/index');

const scorecardCalculations = {

  /// External Interface
  setData: () => {
    return new Promise((resolve, reject) =>
      scorecardCalculations.calculateAllRows()
        .then (() => resolve('Creditor Calculations Success! :)'))
        .catch(() => resolve('Creditor Calculations Error! :(')));
  },

  /// Main Loop
  calculateAllRows: () => {
    db.ImportedAccount.findAll().then(importedAccounts => {
      let results = {};

      importedAccounts.forEach(creditor => {
        let promises = Object.keys(scorecardCalculations.columns).map(column =>
          scorecardCalculations.setCalculationValue(creditor, column, results));

        Promise.all(promises).then(() =>
          creditor.update(results).then(() =>
            console.log('Creditor - "' + creditor.name + '"', 'Updated with new calculated results')))
      });
    });
  },


  /// Internal Service Functions
  setCalculationValue:  (creditor, columnName, results) => {
    scorecardCalculations[columnName](creditor).then(result => results[columnName] = result)
  },

  rawDataColumnMatch:   (creditor, rawDataColumnName, fallbackValue) => {
    return new Promise((resolve) =>
      db.ImportedAccount.findAll({where: {creditor: creditor.name}}).then(rawCreditors => {
        let result;
        let rawCreditor = rawCreditors[0];

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
      }));
  },

  columns: {

    /// Metadata Columns
    preAvgPctSettlement:  (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'most_accepted_ratio_pre_charge', 0.6),
    preSettlementTerm:    (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'most_accepted_terms_pre_charge', 6),
    preMinPayment:        (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'min_monthly_pay_pre_charge', 'evenpays'),
    preDataPoints:        (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'total_number_settlements_pre_charge', 'Nil'),

    /// Post Charge-off Columns
    postAvgPctSettlement: (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'most_accepted_ratio_post_charge', 0.6),
    postSettlementTerm:   (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'most_accepted_terms_post_charge', 6),
    postMinPayment:       (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'min_monthly_pay_post_charge', 'evenpays'),
    postDataPoints:       (creditor) => scorecardCalculations.rawDataColumnMatch(creditor, 'total_number_settlements_post_charge', 'Nil'),

  }

};

module.exports = scorecardCalculations;
