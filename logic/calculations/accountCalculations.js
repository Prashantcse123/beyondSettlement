const models = require('../../models/index');

const accountCalculations = {

  /// External Interface
  setData: () => {
    let init = [
      accountCalculations.importAccountVariables(),
      accountCalculations.importCreditors(),
      accountCalculations.importCreditorOverrides()
    ];

    return new Promise((resolve, reject) =>
      Promise.all(init).then(() =>
        accountCalculations.calculateAllRows()
            .then (() => resolve('Account Calculations Success! :)'))
            .catch(() => resolve('Account Calculations Error! :(')))
    );
  },

  /// Main Loop
  calculateAllRows: () => {
    return new Promise(resolve => {
      models.Account.destroy({truncate: true});
      let promises = [];

      accountCalculations._rawAccounts.filter(rawAccount =>
        !!rawAccount.programname).forEach(rawAccount =>
          promises.push(accountCalculations.calculateRow(rawAccount)));
      Promise.all(promises).then(() => resolve());
    });
  },

  calculateRow: (rawAccount) => {
    let results = {};
    let promises = Object.keys(accountCalculations.columns).map(column =>
      accountCalculations.setCalculationValue(rawAccount, column, results));

    return new Promise(resolve => {
      Promise.all(promises).then(() => {
        models.Account.create(results).then(() => {
          console.log('Account - "' + rawAccount.accountNumber + '"', 'Created with new calculated results');
          resolve();
        })});
    });
  },

  setCalculationValue:  (rawAccount, columnName, results) => {
    accountCalculations.columns[columnName](rawAccount).then(result =>
      results[columnName] = result)
  },

  /// Internal Service Functions --------------------------------------------------------------------------------------

  importAccountVariables: () => {
    return new Promise(resolve =>
      models.ImportedActiveAccount.findAll().then(results => {
        accountCalculations._rawAccounts = results;
        resolve();
      }));
  },

  importCreditors: () => {
    return new Promise(resolve =>
      models.Creditor.findAll().then(results => {
        accountCalculations._creditors = results;
        resolve();
      }));
  },

  importCreditorOverrides: () => {
    return new Promise(resolve =>
      models.CreditorOverride.findAll().then(results => {
        accountCalculations._creditorOverrides = results;
        resolve();
      }));
  },

  rawDataColumnImport:    (rawAccount, rawDataColumnName, fallbackValue) => {
    return new Promise((resolve) => {
      resolve(rawAccount[rawDataColumnName] || fallbackValue);
    });
  },

  endOfMonthPct:          (rawAccount, columnName) => {
    return new Promise(resolve => {
      let result;

      accountCalculations.columns.calc_currentBalance(rawAccount).then(calc_currentBalance => {
        try{
          result = rawAccount[columnName] / calc_currentBalance;
        }catch (ex) {
          result = null;
        }

        resolve(result);
      });
    });
  },

  columns: {

    /// Pre Charge-off Columns
    accountNumber:              (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'account_number'),
    programName:                (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'programname'),
    tradelineName:              (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'tradelinename'),
    creditor:                   (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'creditor'),
    enrolledState:              (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'enrolledstate'),
    avgMonthlyPayment:          (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'avg_monthly_payment'),
    accountDelinquency:         (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'account_deliquency'),
    currentFund:                (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'fund_in_cft'),
    m0Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm0_bal'),
    m1Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm1_bal'),
    m2Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm2_bal'),
    m3Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm3_bal'),
    m4Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm4_bal'),
    m5Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm5_bal'),
    m6Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm6_bal'),
    m7Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm7_bal'),
    m8Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm8_bal'),
    m9Bal:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm9_bal'),
    m10Bal:                     (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm10_bal'),
    m11Bal:                     (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm11_bal'),
    m12Bal:                     (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm12_bal'),
    maxTerm:                    (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'max_term'),
    maxTermFundAccumulation:    (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'max_term_fund_accumulation'),
    enrolledDebt:               (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'enrolled_debt'),
    verifiedBalance:            (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'verifiedbalance'),
    originalBalance:            (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'originalbalance'),
    currentBalance:             (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'currentbalance'),
    currentStage:               (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'currentstage'),
    tradelineLastWorkedOn:      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'tradeline_last_negotiated'),

    calc_accountDelinquency:    (rawAccount) => {
      let creditorFactors = [{
        creditors: ['Bank of America', 'Citibank', 'Best Buy', 'Sears', 'Macys', 'Home Depot', 'Costco', 'Capital One', 'Credit One Bank-Collections', 'Synchrony Bank', 'Walmart', 'Sams Club', 'Amazon/Synchrony', 'Discover', 'Wells Fargo', 'Gap', 'Belk', 'Toys R US', 'Old Navy', 'American Eagle', 'Banana republic', 'Chevron', 'Stein Mart', 'TJ Maxx', 'Care Credit', 'HHGregg', 'Guitar Center', 'Lowes', 'CABELAS', 'Compass Bank', 'Commerce Bank', 'American Express', 'Credit First National Bank'],
        factor: -30,
        condition: rawAccount => rawAccount.account_deliquency - 30 < 0
      }, {
        creditors: ['Barclays'],
        factor: 60,
      }, {
        creditors: ['One Main Financial', 'Lending Club', 'Navy Federal Credit Union'],
        factor: 90,
      }, {
        creditors: ['Avant', 'Prosper'],
        factor: 120,
      }, {
        creditors: ['Best Egg'],
        factor: 150,
      }];

      return new Promise(resolve => {
        let result;

        if (rawAccount.programname === '') {
          result = null;
        }else{
          let creditorFactor = creditorFactors.filter(cf => cf.creditors.includes(rawAccount.creditor))[0];

          if (creditorFactor) {
            if (creditorFactor.condition) {
              if (creditorFactor.condition(rawAccount)) {
                result = rawAccount.account_deliquency + creditorFactor.factor;
              }else{
                result = 0;
              }
            }else{
              result = rawAccount.account_deliquency + creditorFactor.factor;
            }
          }else{
            result = rawAccount.account_deliquency;
          }
        }

        resolve(result);
      });
    },
    calc_currentBalance:        (rawAccount) => {
      return new Promise(resolve => {
        let result;

        if (rawAccount.programname === '') {
          result = null;
        }else{
          if (rawAccount.currentbalance === undefined || rawAccount.currentbalance === null) {
            result = rawAccount.originalbalance;
          }else{
            result = rawAccount.currentbalance;
          }
        }

        resolve(result);
      });
    },

    /// ﻿Overrides check
    rangesFlag:                 (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let maxBalance = Math.max(rawAccount.originalbalance, rawAccount.currentbalance);

        if (rawAccount.creditor === 'Capital One') {
          if (maxBalance <= 500) {
            result = 2;
          }else if (maxBalance <= 1000) {
            result = 3;
          }else if (maxBalance <= 2000) {
            result = 4;
          }else if (maxBalance <= 5000) {
            result = 5;
          }else if (maxBalance <= 6000) {
            result = 6;
          }else{
            result = 7;
          }
        }else{
          result = null;
        }

        resolve(result);
      });
    },
    multipleProductsFlag:       (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let relevantCreditors = ['US BANK', 'Wells Fargo', 'DISCOVER'];

        if (relevantCreditors.includes(rawAccount.creditor)) {
          if (rawAccount.account_number.length >= 16) {
            result = 1;
          }else{
            result = 0;
          }
        }else{
          result = null;
        }

        resolve(result);
      });
    },
    // creditorCheck1: DataTypes.STRING,

    /// ﻿Fund Accumulation
    endOfCurrentMonth:          (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm0_bal'),
    monthOut1:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm1_bal'),
    monthOut2:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm2_bal'),
    monthOut3:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm3_bal'),
    monthOut4:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm4_bal'),
    monthOut5:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm5_bal'),
    monthOut6:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm6_bal'),
    monthOut7:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm7_bal'),
    monthOut8:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm8_bal'),
    monthOut9:                  (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm9_bal'),
    monthOut10:                 (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm10_bal'),
    monthOut11:                 (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm11_bal'),
    monthOut12:                 (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm12_bal'),
    maxTermOut:                 (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'max_term_fund_accumulation'),

    minOfFunds:                 (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.columns.monthOut2(rawAccount),
          accountCalculations.columns.monthOut3(rawAccount),
          accountCalculations.columns.monthOut4(rawAccount),
          accountCalculations.columns.monthOut5(rawAccount),
          accountCalculations.columns.monthOut6(rawAccount),
          accountCalculations.columns.monthOut7(rawAccount),
          accountCalculations.columns.monthOut8(rawAccount),
          accountCalculations.columns.monthOut9(rawAccount),
          accountCalculations.columns.monthOut10(rawAccount),
          accountCalculations.columns.monthOut11(rawAccount),
          accountCalculations.columns.monthOut12(rawAccount),
        ];

        accountCalculations.creditorReprocess.avgPctSettlement(rawAccount).then(avgPctSettlement => {
          Promise.all(promises).then(results => {
            try{
              result = Math.min.apply(this, results) / avgPctSettlement;
            }catch (ex) {
              result = 0;
            }

            resolve(result);
          });
        });
      });
    },
    lessThen5PctSettlementFlag: (rawAccount) => {
      return new Promise(resolve => {
        let result;

        accountCalculations.columns.minOfFunds(rawAccount).then(minOfFunds => {
          if (minOfFunds >= 0.05) {
            result = 1;
          }else{
            result = 0;
          }

          resolve(result);
        });
      });
    }, // NOTE: ﻿Merilytics: Flag to exclude the payments having less than 5% of the settlement

    notSettlePreChargeOffFlag:  (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.columns.calc_accountDelinquency(rawAccount),
          accountCalculations.columns.rangesFlag(rawAccount),
          accountCalculations.columns.multipleProductsFlag(rawAccount)
        ];

        Promise.all(promises).then(results => {
          let calc_accountDelinquency = results[0];
          let rangesFlag = results[1];
          let multipleProductsFlag = results[2];
          let accountCreditorTermConcat = rawAccount.creditor + rangesFlag + multipleProductsFlag;
          let concatRelevantCreditors = ['US BANK0', 'Wells Fargo0', 'DISCOVER0'];
          let relevantCreditors = ['Capital One'];

          if (calc_accountDelinquency < 180) {
            if (concatRelevantCreditors.includes(accountCreditorTermConcat) || relevantCreditors.includes(rawAccount.creditor)) {
              result = 1;
            }else{
              result = 0;
            }
          }else{
            result = 0;
          }
          resolve(result);
        });
      });
    }, // NOTE: ﻿Merilytics: Flag to exclude the creditors who don't settle pre charge off

    creditorScore:              (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let creditor = accountCalculations._creditors.filter(cr => cr.name === rawAccount.creditor)[0];

        if (creditor && creditor.score) {
          result = creditor.score;
        }else{
          result = 5;
        }

        resolve(result);
      });
    },
    delinquencyFlag:            (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.columns.calc_accountDelinquency(rawAccount),
          accountCalculations.columns.creditorScore(rawAccount),
        ];

        Promise.all(promises).then(results => {
          let calc_accountDelinquency = results[0];
          let creditorScore = results[1];

          if (calc_accountDelinquency >= 100) {
            result = 1;
          }else{
            if (creditorScore > 6) {
              result = 1;
            }else{
              result = 0;
            }
          }

          resolve(result);
        });
      });
    }, // NOTE: ﻿﻿Merilytics: Flag to exclude accounts with less than 100 days of delinquency and having creditor score less than 7

    /// ﻿Eligibility for settlement
    isEligible:                 (rawAccount) => {
    //   return new Promise(resolve => {
    //     let result;
    //     let promises = [
    //       accountCalculations.columns.lessThen5PctSettlementFlag(rawAccount),
    //       accountCalculations.columns.notSettlePreChargeOffFlag(rawAccount),
    //       accountCalculations.columns.delinquencyFlag(rawAccount),
    //     ];
    //
    //     Promise.all(promises).then(results => {
    //       let lessThen5PctSettlementFlag = results[0];
    //       let notSettlePreChargeOffFlag = results[1];
    //       let delinquencyFlag = results[2];
    //
    //       if (lessThen5PctSettlementFlag === 1 && notSettlePreChargeOffFlag !== 1 && delinquencyFlag === 1) {
    //         if () {
    //
    //         }
    //       }
    //
    //       resolve(result);
    //     });
    //   });
    },


    /// Creditors tab ==> (will be calculated on the fly, see creditorReprocess on this file)

    /// Eligibility Criteria
    hasSufficientFundsAtTheEndOfSettlement: DataTypes.INTEGER, // NOTE: ﻿Merilytics: Eligibilty based on fund availability at the end of calculated term or max allowable term
    minPaymentPct: DataTypes.FLOAT, // NOTE: ﻿Merilytics: % Minimum payment to be paid
    calculatedTerm: DataTypes.STRING, // NOTE: ﻿Merilytics: Calculating the projected settlement term based on fund availability

    /// ﻿Check for minimum payment every month of term
    fundBalancePayment1: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (end of month) after making 1st payment
    fundBalancePayment2: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (1 month out) after making 2 payments
    fundBalancePayment3: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (2 month out) after making 3 payments
    fundBalancePayment4: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (3 month out) after making 4 payments
    fundBalancePayment5: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (4 month out) after making 5 payments
    fundBalancePayment6: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (5 month out) after making 6 payments
    fundBalancePayment7: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (6 month out) after making 7 payments
    fundBalancePayment8: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (7 month out) after making 8 payments
    fundBalancePayment9: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (8 month out) after making 9 payments
    fundBalancePayment10: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (9 month out) after making 10 payments
    fundBalancePayment11: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (10 month out) after making 11 payments
    fundBalancePayment12: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (11 month out) after making 12 payments
    fundBalancePayment13: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Balance fund  %  (12 month out) after making 13 payments
    minCheck: DataTypes.STRING, // NOTE: ﻿Merilytics: If the minimum check <0, then a term payment will be NSF
    termConsidered: DataTypes.STRING,

    settlementAmountAsPctOfVerifiedDebt: DataTypes.FLOAT,
    feePct: DataTypes.FLOAT,
    feeAmount: DataTypes.FLOAT
  },

  creditorReprocess: {

    reprocessColumnWithOverride:  (rawAccount, creditorColumnSuffix, creditorOverrideColumnSuffix, fallbackValue) => {
      return new Promise(resolve => {
        let promises = [
          accountCalculations.columns.calc_accountDelinquency(rawAccount),
          accountCalculations.columns.rangesFlag(rawAccount),
          accountCalculations.columns.multipleProductsFlag(rawAccount)
        ];

        Promise.all(promises).then(results => {
          let calc_accountDelinquency = results[0];
          let rangesFlag = results[1];
          let multipleProductsFlag = results[2];
          let accountCreditorTermConcat = rawAccount.creditor + rangesFlag + multipleProductsFlag;
          let creditor = accountCalculations._creditors.filter(cr => cr.name === rawAccount.creditor)[0];
          let creditorOverride = accountCalculations._creditorOverrides.filter(co =>
            (co.creditor + co.accountNumberFlag + co.rangeFlag) === accountCreditorTermConcat)[0];

          if (creditorOverride) {
            if (calc_accountDelinquency < 180) {
              resolve(creditorOverride['pre' + creditorOverrideColumnSuffix]);
            }else{
              resolve(creditorOverride['post' + creditorOverrideColumnSuffix]);
            }
          }else{
            if (creditor) {
              if (calc_accountDelinquency < 180) {
                if (creditor['pre' + creditorColumnSuffix] !== -1) {
                  resolve(creditor['pre' + creditorColumnSuffix]);
                }else if (creditor['post' + creditorColumnSuffix] !== -1) {
                  resolve(creditor['post' + creditorColumnSuffix]);
                }else{
                  resolve(fallbackValue);
                }
              }else{
                if (creditor['post' + creditorColumnSuffix] !== -1) {
                  resolve(creditor['post' + creditorColumnSuffix]);
                }else if (creditor['pre' + creditorColumnSuffix] !== -1) {
                  resolve(creditor['pre' + creditorColumnSuffix]);
                }else{
                  resolve(fallbackValue);
                }
              }
            }else{
              resolve(fallbackValue);
            }
          }
        });
      });
    },

    avgPctSettlement:             (rawAccount) => accountCalculations.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'AvgPctSettlement', 'PctSettlementRate', 0.6),
    settlementTerm:               (rawAccount) => accountCalculations.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'SettlementTerm', 'SettlementTerm', 6),
    minPayment:                   (rawAccount) => accountCalculations.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'MinPayment', 'MinimumMonthlyPay', 'evenpays'),

  }

};

module.exports = accountCalculations;
