const models = require('../../models/index');
const calculationsHelper = require('./calculationsHelper');

const accountCalculations = {

  /// External Interface
  setData: () => {
    calculationsHelper.initCache(accountCalculations);

    let init = Promise.all([
      accountCalculations.importActiveAccounts(),
      accountCalculations.importCreditors(),
      accountCalculations.importCreditorOverrides()
    ]);

    return new Promise((resolve, reject) =>
      init.then(() => {
        let rawAccounts = accountCalculations._rawAccounts.filter(rawAccount =>
          !!rawAccount.programname);

        calculationsHelper.calculateAllRows(accountCalculations, 'Account', rawAccounts, 'create')
          .then (() => resolve('Account Calculations Success! :)'))
          .catch(() => resolve('Account Calculations Error! :('))
      })
    );
  },



  // initCache: () => {
  //   accountCalculations._cachedColumns = {};
  //
  //   Object.keys(accountCalculations.columns).forEach(columnName => {
  //     let oldFunc = accountCalculations.columns[columnName];
  //     let newFunc = (account,b,c,d,e,f,g) => {
  //       return new Promise(resolve => {
  //         // console.log(Object.keys(accountCalculations._cachedColumns));
  //         if (Object.keys(accountCalculations._cachedColumns).includes(columnName)) {
  //           resolve(accountCalculations._cachedColumns[columnName]);
  //         }else{
  //           oldFunc(account,b,c,d,e,f,g).then(result => {
  //             accountCalculations._cachedColumns[columnName] = result;
  //             resolve(result);
  //           });
  //         }
  //       });
  //     };
  //
  //     accountCalculations.columns[columnName] = newFunc;
  //   });
  // },

  // initColumns: () => {
  //   accountCalculations._cachedColumns = {};
  //
  //   Object.keys(accountCalculations.columns).forEach(columnName => {
  //     let oldFunc = accountCalculations.columns[columnName];
  //     let newFunc = (account,b,c,d,e,f,g) => {
  //       let cachedColumnName = account.account_number + columnName;
  //
  //       return new Promise(resolve => {
  //         console.log(Object.keys(accountCalculations._cachedColumns));
  //         if (Object.keys(accountCalculations._cachedColumns).includes(cachedColumnName)) {
  //           resolve(accountCalculations._cachedColumns[cachedColumnName]);
  //         }else{
  //           oldFunc(account,b,c,d,e,f,g).then(result => {
  //             accountCalculations._cachedColumns[cachedColumnName] = result;
  //             resolve(result);
  //           });
  //         }
  //       });
  //     };
  //
  //     accountCalculations.columns[columnName] = newFunc;
  //   });
  // },

  // calculateAllRows: () => {
  //   return new Promise(resolve => {
  //     let rawAccounts = accountCalculations._rawAccounts.filter(rawAccount => !!rawAccount.programname);
  //     let rowIndex = 0;
  //     let calcRowIndex = () => {
  //       console.log('index', rowIndex, rawAccounts.length);
  //       if (rowIndex === rawAccounts.length) {
  //         console.log('bulk insert');
  //         models.Account.bulkCreate(accountCalculations._newAccounts).then(() => resolve());
  //       }else{
  //         accountCalculations.calculateRow(rawAccounts[rowIndex]).then(() => {
  //           rowIndex++;
  //           calcRowIndex();
  //         });
  //       }
  //     };
  //
  //     accountCalculations._newAccounts = [];
  //     models.Account.destroy({truncate: true});
  //     calcRowIndex();
  //   });
  // },

  // calculateRow: (rawAccount) => {
  //   let results = {};
  //   let promises = Object.keys(accountCalculations.columns).map(column =>
  //     accountCalculations.setCalculationValue(rawAccount, column, results));
  //
  //   accountCalculations._cachedColumns = {};
  //
  //   return new Promise(resolve => {
  //     Promise.all(promises).then(() => {
  //       accountCalculations._newAccounts.push(results);
  //       // models.Account.create(results).then(() => {
  //       //   console.log('Account - "' + rawAccount.account_number + '"', 'Created with new calculated results');
  //         // console.log(results);
  //         resolve();
  //       // })
  //     });
  //   });
  // },

  // setCalculationValue:  (rawAccount, columnName, results) => {
  //   accountCalculations.columns[columnName](rawAccount).then(result =>
  //     results[columnName] = result)
  // },

  /// Internal Service Functions --------------------------------------------------------------------------------------

  importActiveAccounts:     () => {
    return new Promise(resolve =>
      models.ImportedActiveAccount.findAll().then(results => {
        accountCalculations._rawAccounts = results;
        resolve();
      }));
  },

  importCreditors:          () => {
    return new Promise(resolve =>
      models.Creditor.findAll().then(results => {
        accountCalculations._creditors = results;
        resolve();
      }));
  },

  importCreditorOverrides:  () => {
    return new Promise(resolve =>
      models.CreditorOverride.findAll().then(results => {
        accountCalculations._creditorOverrides = results;
        resolve();
      }));
  },

  rawDataColumnImport:      (rawAccount, rawDataColumnName, fallbackValue) => {
    return new Promise((resolve) => {
      resolve(rawAccount[rawDataColumnName] || fallbackValue);
    });
  },

  endOfMonthPct:            (rawAccount, columnName) => {
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

  fundBalancePaymentPct:    (rawAccount, columnIndex) => {
    return new Promise(resolve => {
      let result;
      let endOfMonthPctColumnName = (columnIndex === 1 ? 'endOfCurrentMonth' : 'monthOut' + (columnIndex - 1));
      let promises = [
        accountCalculations.columns[endOfMonthPctColumnName](rawAccount),
        accountCalculations.columns.minPaymentPct(rawAccount),
        accountCalculations.creditorReprocess.avgPctSettlement(rawAccount)
      ];

      Promise.all(promises).then(results => {
        let endOfMonthPctValue = results[0];
        let minPaymentPct = results[1];
        let avgPctSettlement = results[2];

        try {
          result = parseFloat(endOfMonthPctValue) - Math.min(columnIndex * minPaymentPct, avgPctSettlement);
        }catch(ex) {
          result = null;
        }

        resolve(result);
      });
    });
  },

  columns: {

    /// Pre Charge-off Columns
    accountNumber:                          (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'account_number'),
    programName:                            (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'programname'),
    tradelineName:                          (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'tradelinename'),
    creditor:                               (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'creditor'),
    enrolledState:                          (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'enrolledstate'),
    avgMonthlyPayment:                      (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'avg_monthly_payment'),
    accountDelinquency:                     (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'account_deliquency'),
    currentFund:                            (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'fund_in_cft'),
    m0Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm0_bal'),
    m1Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm1_bal'),
    m2Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm2_bal'),
    m3Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm3_bal'),
    m4Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm4_bal'),
    m5Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm5_bal'),
    m6Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm6_bal'),
    m7Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm7_bal'),
    m8Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm8_bal'),
    m9Bal:                                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm9_bal'),
    m10Bal:                                 (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm10_bal'),
    m11Bal:                                 (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm11_bal'),
    m12Bal:                                 (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'm12_bal'),
    maxTerm:                                (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'max_term'),
    maxTermFundAccumulation:                (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'max_term_fund_accumulation'),
    enrolledDebt:                           (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'enrolled_debt'),
    verifiedBalance:                        (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'verifiedbalance'),
    originalBalance:                        (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'originalbalance'),
    currentBalance:                         (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'currentbalance'),
    currentStage:                           (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'currentstage'),
    tradelineLastWorkedOn:                  (rawAccount) => accountCalculations.rawDataColumnImport(rawAccount, 'tradeline_last_negotiated'),

    calc_accountDelinquency:                (rawAccount) => {
      let creditorFactors = [{
        creditors: ['Bank of America', 'Citibank', 'Best Buy', 'Sears', 'Macys', 'Home Depot', 'Costco', 'Capital One', 'Credit One Bank-Collections', 'Synchrony Bank', 'Walmart', 'Sams Club', 'Amazon/Synchrony', 'Discover', 'Wells Fargo', 'Gap', 'Belk', 'Toys R US', 'Old Navy', 'American Eagle', 'Banana republic', 'Chevron', 'Stein Mart', 'TJ Maxx', 'Care Credit', 'HHGregg', 'Guitar Center', 'Lowes', 'CABELAS', 'Compass Bank', 'Commerce Bank', 'American Express', 'Credit First National Bank'],
        factor: -30,
        condition: rawAccount => parseInt(rawAccount.account_deliquency) - 30 < 0
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
                result = parseInt(rawAccount.account_deliquency) + creditorFactor.factor;
              }else{
                result = 0;
              }
            }else{
              result = parseInt(rawAccount.account_deliquency) + creditorFactor.factor;
            }
          }else{
            result = parseInt(rawAccount.account_deliquency);
          }
        }

        resolve(result);
      });
    },
    calc_currentBalance:                    (rawAccount) => {
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
    rangesFlag:                             (rawAccount) => {
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
    multipleProductsFlag:                   (rawAccount) => {
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

    /// ﻿Fund Accumulation
    endOfCurrentMonth:                      (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm0_bal'),
    monthOut1:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm1_bal'),
    monthOut2:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm2_bal'),
    monthOut3:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm3_bal'),
    monthOut4:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm4_bal'),
    monthOut5:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm5_bal'),
    monthOut6:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm6_bal'),
    monthOut7:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm7_bal'),
    monthOut8:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm8_bal'),
    monthOut9:                              (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm9_bal'),
    monthOut10:                             (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm10_bal'),
    monthOut11:                             (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm11_bal'),
    monthOut12:                             (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'm12_bal'),
    maxTermOut:                             (rawAccount) => accountCalculations.endOfMonthPct(rawAccount, 'max_term_fund_accumulation'),

    minOfFunds:                             (rawAccount) => {
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
              // console.log('minmin', avgPctSettlement, results);
            }catch (ex) {
              result = 0;
            }

            resolve(result);
          });
        });
      });
    },
    lessThen5PctSettlementFlag:             (rawAccount) => {
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

    notSettlePreChargeOffFlag:              (rawAccount) => {
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
          let accountCreditorTermConcat = rawAccount.creditor + (rangesFlag + multipleProductsFlag);
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

    creditorScore:                          (rawAccount) => {
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
    delinquencyFlag:                        (rawAccount) => {
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
    isEligible:                             (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let relevantCreditors = ['US BANK', 'American Express', 'Elan Financial', 'Kroger'];
        let promises = [
          accountCalculations.columns.lessThen5PctSettlementFlag(rawAccount),
          accountCalculations.columns.notSettlePreChargeOffFlag(rawAccount),
          accountCalculations.columns.delinquencyFlag(rawAccount),
          accountCalculations.columns.hasSufficientFundsAtTheEndOfSettlement(rawAccount),
          accountCalculations.columns.minCheck(rawAccount),
          accountCalculations.columns.accountDelinquency(rawAccount),
        ];

        Promise.all(promises).then(results => {
          let lessThen5PctSettlementFlag = results[0];
          let notSettlePreChargeOffFlag = results[1];
          let delinquencyFlag = results[2];
          let hasSufficientFundsAtTheEndOfSettlement = results[3];
          let minCheck = results[4];
          let accountDelinquency = results[5];

          if (lessThen5PctSettlementFlag === 1 && notSettlePreChargeOffFlag !== 1 && delinquencyFlag === 1) {
            if (hasSufficientFundsAtTheEndOfSettlement === 0) {
              result = 0;
            }else{
              if (minCheck >= 0) {
                if (relevantCreditors.includes(rawAccount.creditor) && accountDelinquency < 90) {
                  result = 0;
                }else{
                  result = 1;
                }
              }else{
                result = 0;
              }
            }
          }else{
            result = 0;
          }

          resolve(result);
        });
      });
    },


    /// Creditors tab ==> (will be calculated on the fly, see creditorReprocess on this file)

    /// Eligibility Criteria
    hasSufficientFundsAtTheEndOfSettlement: (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.creditorReprocess.avgPctSettlement(rawAccount),
          accountCalculations.creditorReprocess.settlementTerm(rawAccount),
          accountCalculations.columns.calculatedTerm(rawAccount),
          accountCalculations.columns.maxTermOut(rawAccount)
        ];

        Promise.all(promises).then(results => {
          let avgPctSettlement = results[0];
          let settlementTerm = results[1];
          let calculatedTerm = results[2];
          let maxTermOut = results[3];

          if (calculatedTerm === 'More than 13') {
            if (maxTermOut >= avgPctSettlement) {
              result = 1;
            }else{
              result = 0;
            }
          }else{
            if (parseInt(calculatedTerm) <= settlementTerm) {
              result = 1;
            }else{
              result = 0;
            }
          }

          resolve(result);
        });
      });
    },  // NOTE: ﻿Merilytics: Eligibilty based on fund availability at the end of calculated term or max allowable term
    minPaymentPct:                          (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.creditorReprocess.avgPctSettlement(rawAccount),
          accountCalculations.creditorReprocess.settlementTerm(rawAccount),
          accountCalculations.creditorReprocess.minPayment(rawAccount)
        ];

        Promise.all(promises).then(results => {
          let avgPctSettlement = results[0];
          let settlementTerm = results[1];
          let minPayment = results[2];
          let originalBalance = rawAccount.originalbalance;
          let currentBalance = rawAccount.currentbalance;

          if (minPayment === 'evenpays') {
            result = avgPctSettlement / settlementTerm;
          }else{
            try{
              result = parseFloat(minPayment) / Math.max(originalBalance, currentBalance);
            }catch(ex){
              result = null;
            }
          }

          resolve(result);
        });
      });
    }, // NOTE: ﻿Merilytics: % Minimum payment to be paid
    calculatedTerm:                         (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.creditorReprocess.avgPctSettlement(rawAccount),
          accountCalculations.columns.feePct(rawAccount),
          accountCalculations.columns.endOfCurrentMonth(rawAccount),
          accountCalculations.columns.monthOut1(rawAccount),
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
          accountCalculations.columns.monthOut12(rawAccount)
        ];

        Promise.all(promises).then(results => {
          let feePct = results[0];
          let avgPctSettlement = results[1];
          let fundAccumulationValues = results;

          fundAccumulationValues.shift();
          fundAccumulationValues.shift();

          let fundAccumulationValuesForCriteria = fundAccumulationValues.filter(fav =>
            fav >= (feePct + avgPctSettlement));

          if (!fundAccumulationValuesForCriteria.length) {
            result = 'More than 13';
          }else{
            result = Math.min.apply(this, fundAccumulationValuesForCriteria);
            result = fundAccumulationValuesForCriteria.indexOf(result) + 1;
          }

          resolve(result);
        });
      });
    }, // NOTE: ﻿Merilytics: Calculating the projected settlement term based on fund availability

    /// ﻿Check for minimum payment every month of term
    fundBalancePayment1:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 1), // NOTE: ﻿Merilytics: Balance fund  %  (end of month) after making 1st payment
    fundBalancePayment2:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 2), // NOTE: ﻿Merilytics: Balance fund  %  (1 month out) after making 2 payments
    fundBalancePayment3:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 3), // NOTE: ﻿Merilytics: Balance fund  %  (2 month out) after making 3 payments
    fundBalancePayment4:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 4), // NOTE: ﻿Merilytics: Balance fund  %  (3 month out) after making 4 payments
    fundBalancePayment5:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 5), // NOTE: ﻿Merilytics: Balance fund  %  (4 month out) after making 5 payments
    fundBalancePayment6:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 6), // NOTE: ﻿Merilytics: Balance fund  %  (5 month out) after making 6 payments
    fundBalancePayment7:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 7), // NOTE: ﻿Merilytics: Balance fund  %  (6 month out) after making 7 payments
    fundBalancePayment8:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 8), // NOTE: ﻿Merilytics: Balance fund  %  (7 month out) after making 8 payments
    fundBalancePayment9:                    (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 9), // NOTE: ﻿Merilytics: Balance fund  %  (8 month out) after making 9 payments
    fundBalancePayment10:                   (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 10), // NOTE: ﻿Merilytics: Balance fund  %  (9 month out) after making 10 payments
    fundBalancePayment11:                   (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 11), // NOTE: ﻿Merilytics: Balance fund  %  (10 month out) after making 11 payments
    fundBalancePayment12:                   (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 12), // NOTE: ﻿Merilytics: Balance fund  %  (11 month out) after making 12 payments
    fundBalancePayment13:                   (rawAccount) => accountCalculations.fundBalancePaymentPct(rawAccount, 13), // NOTE: ﻿Merilytics: Balance fund  %  (12 month out) after making 13 payments
    minCheck:                               (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let promises = [
          accountCalculations.columns.termConsidered(rawAccount),
          accountCalculations.columns.fundBalancePayment1(rawAccount),
          accountCalculations.columns.fundBalancePayment2(rawAccount),
          accountCalculations.columns.fundBalancePayment3(rawAccount),
          accountCalculations.columns.fundBalancePayment4(rawAccount),
          accountCalculations.columns.fundBalancePayment5(rawAccount),
          accountCalculations.columns.fundBalancePayment6(rawAccount),
          accountCalculations.columns.fundBalancePayment7(rawAccount),
          accountCalculations.columns.fundBalancePayment8(rawAccount),
          accountCalculations.columns.fundBalancePayment9(rawAccount),
          accountCalculations.columns.fundBalancePayment10(rawAccount),
          accountCalculations.columns.fundBalancePayment11(rawAccount),
          accountCalculations.columns.fundBalancePayment12(rawAccount),
          accountCalculations.columns.fundBalancePayment13(rawAccount)
        ];

        Promise.all(promises).then(results => {
          let termConsidered = results[0];
          let fundBalancePaymentValues = [];

          results.shift();

          for (let i = 0; i < termConsidered; i++) {
            fundBalancePaymentValues.push(results[i]);
          }

          try{
            result = Math.min.apply(this, fundBalancePaymentValues);
          }catch(ex) {
            result = -1;
          }

          resolve(result);
        });
      });
    }, // NOTE: ﻿Merilytics: If the minimum check <0, then a term payment will be NSF
    termConsidered:                         (rawAccount) => {
      return new Promise(resolve => {
        let result;

        accountCalculations.columns.calculatedTerm(rawAccount).then(calculatedTerm => {
          if (calculatedTerm === 'More than 13') {
            result = 13;
          }else{
            result = parseInt(calculatedTerm);
          }

          resolve(result);
        });
      });
    },
    settlementAmountAsPctOfVerifiedDebt:    (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let originalBalance = rawAccount.originalbalance;
        let currentBalance = rawAccount.currentbalance;

        accountCalculations.creditorReprocess.avgPctSettlement(rawAccount).then(avgPctSettlement => {
          if (!avgPctSettlement) {
            result = null;
          }else{
            result = avgPctSettlement * Math.max(originalBalance, currentBalance) / originalBalance;
          }

          resolve(result);
        });
      });
    },
    feePct:                                 (rawAccount) => {
      return new Promise(resolve => {
        let result;

        accountCalculations.columns.settlementAmountAsPctOfVerifiedDebt(rawAccount).then(settlementAmountAsPctOfVerifiedDebt => {
          if (!settlementAmountAsPctOfVerifiedDebt) {
            result = null;
          }else if (settlementAmountAsPctOfVerifiedDebt > 1) {
              result = 0;
          }else if (settlementAmountAsPctOfVerifiedDebt >= 0.75) {
            result = 1 - settlementAmountAsPctOfVerifiedDebt;
          }else{
            result = 0.25;
          }

          resolve(result);
        });
      });
    },
    feeAmount:                              (rawAccount) => {
      return new Promise(resolve => {
        let result;
        let originalBalance = rawAccount.originalbalance;

        accountCalculations.columns.feePct(rawAccount).then(feePct => {
          if (!feePct) {
            result = null;
          }else{
            result = feePct * originalBalance;
          }

          resolve(result);
        });
      });
    }

  },

  creditorReprocess: {

    reprocessColumnWithOverride:  (rawAccount, creditorColumnSuffix, creditorOverrideColumnSuffix, fallbackValue) => {
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
          let creditor = accountCalculations._creditors.filter(cr => cr.name === rawAccount.creditor)[0];
          let creditorOverride = accountCalculations._creditorOverrides.filter(co =>
            (co.creditor + co.accountNumberFlag + co.rangeFlag) === accountCreditorTermConcat)[0];

          if (creditorOverride) {
            if (calc_accountDelinquency < 180) {
              result = creditorOverride['pre' + creditorOverrideColumnSuffix];
            }else{
              result = creditorOverride['post' + creditorOverrideColumnSuffix];
            }
          }else{
            if (creditor) {
              let preCreditorColumnValue = creditor['pre' + creditorColumnSuffix];
                  preCreditorColumnValue = (!preCreditorColumnValue ? -1 : preCreditorColumnValue);
              let postCreditorColumnValue = creditor['post' + creditorColumnSuffix];
                  postCreditorColumnValue = (!postCreditorColumnValue ? -1 : postCreditorColumnValue);

              if (calc_accountDelinquency < 180) {
                if (preCreditorColumnValue !== -1) {
                  result = preCreditorColumnValue;
                }else if (postCreditorColumnValue !== -1) {
                  result = postCreditorColumnValue;
                }else{
                  result = fallbackValue;
                }
              }else{
                if (postCreditorColumnValue !== -1) {
                  result = postCreditorColumnValue;
                }else if (preCreditorColumnValue !== -1) {
                  result = preCreditorColumnValue;
                }else{
                  result = fallbackValue;
                }
              }
            }else{
              result = fallbackValue;
            }
          }

          if (!result) {
            console.log(creditorColumnSuffix, 'is null for creditor', rawAccount.creditor, 'and account', rawAccount.account_number)
          }

          resolve(result);
        });
      });
    },

    avgPctSettlement:             (rawAccount) => accountCalculations.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'AvgPctSettlement', 'PctSettlementRate', 0.6),
    settlementTerm:               (rawAccount) => accountCalculations.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'SettlementTerm', 'SettlementTerm', 6),
    minPayment:                   (rawAccount) => accountCalculations.creditorReprocess.reprocessColumnWithOverride(rawAccount, 'MinPayment', 'MinimumMonthlyPay', 'evenpays'),

  }

};

module.exports = accountCalculations;
