const models = require('../../models/index');
const calculationsHelper = require('./calculationsHelper');

const scorecardCalculations = {

  /// External Interface
  // setData: () => {
  //   let init = [
  //     scorecardCalculations.importAccounts(),
  //     scorecardCalculations.importCreditors(),
  //     scorecardCalculations.importStates(),
  //     scorecardCalculations.importMonthlyProgramPaymentRanges(),
  //     scorecardCalculations.importAccountDelinquencyRanges(),
  //     scorecardCalculations.importAvgAcceptedSettlementRanges(),
  //     scorecardCalculations.importSettlementTermRanges(),
  //     scorecardCalculations.importAccountStatusValues(),
  //     scorecardCalculations.importEnrollDebtRanges(),
  //     scorecardCalculations.importWeightageFactors(),
  //   ];
  //
  //   return new Promise((resolve, reject) =>
  //     Promise.all(init).then(() =>
  //       scorecardCalculations.calculateAllRows()
  //         .then (() => resolve('Scorecard Calculations Success! :)'))
  //         .catch(() => resolve('Scorecard Calculations Error! :(')))
  //   );
  // },

  setData: () => {
    calculationsHelper.initCache(scorecardCalculations);

    let init = Promise.all([
      scorecardCalculations.importAccounts(),
      scorecardCalculations.importCreditors(),
      scorecardCalculations.importStates(),
      scorecardCalculations.importMonthlyProgramPaymentRanges(),
      scorecardCalculations.importAccountDelinquencyRanges(),
      scorecardCalculations.importAvgAcceptedSettlementRanges(),
      scorecardCalculations.importSettlementTermRanges(),
      scorecardCalculations.importAccountStatusValues(),
      scorecardCalculations.importEnrollDebtRanges(),
      scorecardCalculations.importWeightageFactors(),
    ]);

    return new Promise((resolve, reject) =>
      init.then(() => {
        let accounts = scorecardCalculations._accounts;

        calculationsHelper.calculateAllRows(scorecardCalculations, 'Scorecard', accounts, 'create')
          .then (() => resolve('Scorecard Calculations Success! :)'))
          .catch(() => resolve('Scorecard Calculations Error! :('))
      })
    );
  },

  /// Main Loop
  // calculateAllRows: () => {
  //   return new Promise(resolve => {
  //     let promises = [];
  //
  //     models.Scorecard.destroy({truncate: true});
  //
  //     scorecardCalculations._accounts.forEach(rawScorecard =>
  //         promises.push(scorecardCalculations.calculateRow(rawScorecard)));
  //
  //     Promise.all(promises).then(() => resolve());
  //   });
  // },

  // calculateAllRows: () => {
  //   console.log('aaa');
  //   return new Promise(resolve => {
  //     scorecardCalculations._newRecords = [];
  //     models.Scorecard.destroy({truncate: true});
  //
  //     let accounts = scorecardCalculations._accounts;
  //     let rowIndex = 0;
  //     let calcRowIndex = () => {
  //       console.log('index', rowIndex);
  //       if (rowIndex === accounts.length) {
  //         models.Scorecard.bulkCreate(scorecardCalculations._newRecords)
  //           .then(() => resolve());
  //         return;
  //       }
  //       scorecardCalculations.calculateRow(accounts[rowIndex]).then(() => {
  //         rowIndex++;
  //         calcRowIndex();
  //       });
  //     };
  //
  //     calcRowIndex();
  //   });
  // },
  //
  // calculateRow: (rawScorecard) => {
  //   let results = {};
  //   let promises = Object.keys(scorecardCalculations.columns).map(column =>
  //     scorecardCalculations.setCalculationValue(rawScorecard, column, results));
  //
  //   return new Promise(resolve => {
  //     Promise.all(promises).then(() => {
  //       // models.Scorecard.create(results).then(() => {
  //         // console.log('Scorecard - "' + rawScorecard.scorecardNumber + '"', 'Created with new calculated results');
  //       scorecardCalculations._newRecords.push(results);
  //         resolve();
  //       // })
  //     });
  //   });
  // },
  //
  // setCalculationValue:  (rawScorecard, columnName, results) => {
  //   scorecardCalculations.columns[columnName](rawScorecard).then(result =>
  //     results[columnName] = result)
  // },

  /// Internal Service Functions --------------------------------------------------------------------------------------

  importAccounts: () => {
    return new Promise(resolve =>
      models.Account.findAll().then(results => {
        scorecardCalculations._accounts = results;
        resolve();
      }));
  },

  importCreditors: () => {
    return new Promise(resolve =>
      models.Creditor.findAll().then(results => {
        scorecardCalculations._creditors = results;
        resolve();
      }));
  },

  importStates: () => {
    return new Promise(resolve =>
      models.State.findAll().then(results => {
        scorecardCalculations._states = results;
        resolve();
      }));
  },

  importMonthlyProgramPaymentRanges: () => {
    return new Promise(resolve =>
      models.MonthlyProgramPayment.findAll().then(results => {
        scorecardCalculations._monthlyProgramPaymentRanges = results;
        resolve();
      }));
  },

  importAccountDelinquencyRanges: () => {
    return new Promise(resolve =>
      models.AccountDelinquency.findAll().then(results => {
        scorecardCalculations._accountDelinquencyRanges = results;
        resolve();
      }));
  },

  importAvgAcceptedSettlementRanges: () => {
    return new Promise(resolve =>
      models.AvgAcceptedSettlement.findAll().then(results => {
        scorecardCalculations._avgAcceptedSettlementRangesRanges = results;
        resolve();
      }));
  },

  importSettlementTermRanges: () => {
    return new Promise(resolve =>
      models.SettlementTerm.findAll().then(results => {
        scorecardCalculations._settlementTermRanges = results;
        resolve();
      }));
  },

  importAccountStatusValues: () => {
    return new Promise(resolve =>
      models.AccountStatus.findAll().then(results => {
        scorecardCalculations._accountStatusValues = results;
        resolve();
      }));
  },

  importEnrollDebtRanges: () => {
    return new Promise(resolve =>
      models.EnrollDebt.findAll().then(results => {
        scorecardCalculations._enrollDebtRanges = results;
        resolve();
      }));
  },

  importWeightageFactors: () => {
    return new Promise(resolve =>
      models.Weightage.findAll().then(results => {
        scorecardCalculations._weightageFactors = results;
        resolve();
      }));
  },

  accountColumnImport:    (account, accountColumnName, fallbackValue) => {
    return new Promise((resolve) => {
      resolve(account[accountColumnName] || fallbackValue);
    });
  },

  calculateWeightageColumn: (account, columnName, columnLabel) => {
    return new Promise(resolve => {
      let result;

      scorecardCalculations.columns[columnName](account).then(columnValue => {
        let weightageFactor = scorecardCalculations._weightageFactors.filter(wf =>
          wf.criteria === columnLabel)[0];

        try{
          result = weightageFactor.weightage * columnValue;
        }catch(ex) {
          result = 0;
        }

        resolve(result);
      });
    });
  },

  columns: {

    /// Metadata
    tradeLineName:                            (account) => scorecardCalculations.accountColumnImport(account, 'tradelineName'),
    programName:                              (account) => scorecardCalculations.accountColumnImport(account, 'programName'),
    creditor:                                 (account) => scorecardCalculations.accountColumnImport(account, 'creditor'),
    accountNumber:                            (account) => scorecardCalculations.accountColumnImport(account, 'accountNumber'),

    /// Metrics
    metrics_creditorScore:                            (account) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          scorecardCalculations.columns.tradeLineName(account),
          scorecardCalculations.columns.creditor(account),
          scorecardCalculations.columns.accountNumber(account)
        ];

        Promise.all(promises).then(results => {
          let tradeLineName = results[0];
          let creditorName = results[1];
          let accountNumber = results[2];
          let creditor = scorecardCalculations._creditors.filter(cr => cr.name === creditorName)[0];

          try{
            if (creditorName === 'Pay pal' && accountNumber.startsWith('5049')) {
              result = 7;
            }else{
              if (!tradeLineName) {
                result = null;
              }else{
                if (!creditor || !creditor.score) {
                  result = 5;
                }else{
                  result = creditor.score;
                }
              }
            }
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    metrics_stateOfResidency:                            (account) => scorecardCalculations.accountColumnImport(account, 'enrolledState'),
    metrics_monthlyPayment:                            (account) => scorecardCalculations.accountColumnImport(account, 'avgMonthlyPayment'),
    metrics_accountDelinquency:                            (account) => scorecardCalculations.accountColumnImport(account, 'calc_accountDelinquency'),
    metrics_pctAvgSettlement:                            (account) => {
      return new Promise(resolve => {
        let result;
        let creditor = scorecardCalculations._creditors.filter(cr =>
          cr.name === account.creditor)[0];

        try{
            if (!creditor || !creditor.preAvgPctSettlement) {
              result = 0.6;
            }else{
              result = creditor.preAvgPctSettlement;
            }
        }catch(ex) {
          result = null;
        }

        resolve(result);
      });
    },
    metrics_settlementTerm:                            (account) => {
      return new Promise(resolve => {
        let result;
        let creditor = scorecardCalculations._creditors.filter(cr =>
          cr.name === account.creditor)[0];

        try{
          if (!creditor || !creditor.preSettlementTerm) {
            result = 6;
          }else{
            result = creditor.preSettlementTerm;
          }
        }catch(ex) {
          result = null;
        }

        resolve(result);
      });
    },
    metrics_fundAccumulation_endOfCurrentMonth: (account) => scorecardCalculations.accountColumnImport(account, 'currentFund'),
    metrics_fundAccumulationPct_endOfCurrentMonth: (account) => scorecardCalculations.accountColumnImport(account, 'endOfCurrentMonth'),
    metrics_fundAccumulationPct_1_monthOut:         (account) => scorecardCalculations.accountColumnImport(account, 'monthOut1'),
    metrics_fundAccumulationPct_2_monthOut: (account) => scorecardCalculations.accountColumnImport(account, 'monthOut2'),
    metrics_fundAccumulationPct_3_monthOut: (account) => scorecardCalculations.accountColumnImport(account, 'monthOut3'),
    metrics_fundAccumulationPct_4_monthOut: (account) => scorecardCalculations.accountColumnImport(account, 'monthOut4'),
    metrics_fundAccumulationPct_5_monthOut: (account) => scorecardCalculations.accountColumnImport(account, 'monthOut5'),
    metrics_fundAccumulationPct_6_monthOut: (account) => scorecardCalculations.accountColumnImport(account, 'monthOut6'),
    metrics_accountStatus: (account) => scorecardCalculations.accountColumnImport(account, 'currentStage'),
    metrics_enrolledDebt: (account) => scorecardCalculations.accountColumnImport(account, 'enrolledDebt'),

    /// Assigned Points
    points_creditorScore: (account) => scorecardCalculations.columns.metrics_creditorScore(account),
    points_stateOfResidency:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_stateOfResidency(account).then(metrics_stateOfResidency => {
          let state = scorecardCalculations._states.filter(st =>
            st.code === metrics_stateOfResidency)[0];

          try{
            result = state.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    points_monthlyPayment:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_monthlyPayment(account).then(metrics_monthlyPayment => {
          let range = scorecardCalculations._monthlyProgramPaymentRanges.filter(a =>
            metrics_monthlyPayment > a.rangeFrom && metrics_monthlyPayment <= a.rangeTo)[0];

          try{
            result = range.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    points_accountDelinquency:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_accountDelinquency(account).then(metrics_accountDelinquency => {
          let range = scorecardCalculations._accountDelinquencyRanges.filter(a =>
            metrics_accountDelinquency > a.rangeFrom && metrics_accountDelinquency <= a.rangeTo)[0];

          try{
            result = range.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    points_pctAvgSettlement:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_pctAvgSettlement(account).then(metrics_pctAvgSettlement => {
          let range = scorecardCalculations._avgAcceptedSettlementRangesRanges.filter(a =>
            metrics_pctAvgSettlement > a.rangeFrom && metrics_pctAvgSettlement <= a.rangeTo)[0];

          try{
            result = range.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    points_settlementTerm:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_settlementTerm(account).then(metrics_settlementTerm => {
          let range = scorecardCalculations._settlementTermRanges.filter(a =>
            metrics_settlementTerm > a.rangeFrom && metrics_settlementTerm <= a.rangeTo)[0];

          try{
            result = range.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    points_accountStatus:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_accountStatus(account).then(metrics_accountStatus => {
          let accountStatus = scorecardCalculations._accountStatusValues.filter(a =>
            a.name === metrics_accountStatus)[0];

          try{
            result = accountStatus.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },
    points_enrolledDebt:                            (account) => {
      return new Promise(resolve => {
        let result;

        scorecardCalculations.columns.metrics_enrolledDebt(account).then(metrics_enrolledDebt => {
          let range = scorecardCalculations._enrollDebtRanges.filter(a =>
            metrics_enrolledDebt > a.rangeFrom && metrics_enrolledDebt <= a.rangeTo)[0];

          try{
            result = range.points;
          }catch(ex) {
            result = null;
          }

          resolve(result);
        });
      });
    },

    /// ﻿Weighted Score
    weight_creditorScore: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_creditorScore', 'Creditor score'),
    weight_stateOfResidency: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_stateOfResidency', 'State of residency'),
    weight_monthlyPayment: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_monthlyPayment', 'Monthly payment'),
    weight_accountDelinquency: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_accountDelinquency', 'Account delinquency'),
    weight_pctAvgSettlement: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_pctAvgSettlement', '% Avg settlement'),
    weight_settlementTerm: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_settlementTerm', 'Settlement term'),
    weight_accountStatus: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_accountStatus', 'Enrolled debt'),
    weight_enrolledDebt: (account) => scorecardCalculations.calculateWeightageColumn(account, 'points_enrolledDebt', 'Account status'),

    /// Summary
    totalScore:                            (account) => {
      return new Promise(resolve => {
        let result = 0;
        let promises = [
          scorecardCalculations.columns.weight_creditorScore(account),
          scorecardCalculations.columns.weight_stateOfResidency(account),
          scorecardCalculations.columns.weight_monthlyPayment(account),
          scorecardCalculations.columns.weight_accountDelinquency(account),
          scorecardCalculations.columns.weight_pctAvgSettlement(account),
          scorecardCalculations.columns.weight_settlementTerm(account),
          scorecardCalculations.columns.weight_accountStatus(account),
          scorecardCalculations.columns.weight_enrolledDebt(account)
        ];

        Promise.all(promises).then(results => {
          console.log(results);
          results.forEach(r => result += r);
          resolve(result);
        });
      });
    },
    // rank: DataTypes.INTEGER,

  }
};

module.exports = scorecardCalculations;
