module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    accountNumber: DataTypes.STRING,
    programName: DataTypes.STRING,
    tradelineName: DataTypes.STRING,
    // creditorId: DataTypes.INTEGER,
    creditor: DataTypes.STRING,
    // enrolledStateId: DataTypes.INTEGER,
    enrolledState: DataTypes.STRING,
    avgMonthlyPayment: DataTypes.FLOAT,
    accountDelinquency: DataTypes.INTEGER,
    currentFund: DataTypes.FLOAT,
    m0Bal: DataTypes.FLOAT,
    m1Bal: DataTypes.FLOAT,
    m2Bal: DataTypes.FLOAT,
    m3Bal: DataTypes.FLOAT,
    m4Bal: DataTypes.FLOAT,
    m5Bal: DataTypes.FLOAT,
    m6Bal: DataTypes.FLOAT,
    m7Bal: DataTypes.FLOAT,
    m8Bal: DataTypes.FLOAT,
    m9Bal: DataTypes.FLOAT,
    m10Bal: DataTypes.FLOAT,
    m11Bal: DataTypes.FLOAT,
    m12Bal: DataTypes.FLOAT,
    maxTerm: DataTypes.INTEGER,
    maxTermFundAccumulation: DataTypes.FLOAT,
    enrolledDebt: DataTypes.FLOAT,
    verifiedBalance: DataTypes.FLOAT,
    originalBalance: DataTypes.FLOAT, // NOTE: ﻿Merilytics: Current debt pulled from "Balance" field of ClientCred table
    currentBalance: DataTypes.FLOAT,
    // currentAccountStatusId: DataTypes.INTEGER,
    currentStage: DataTypes.STRING,
    tradelineLastWorkedOn: DataTypes.DATE,

    calc_accountDelinquency: DataTypes.INTEGER,
    calc_currentBalance: DataTypes.INTEGER,

    /// ﻿Overrides check
    rangesFlag: DataTypes.INTEGER, // NOTE: ﻿Merilytics: Curretly the flag is used to distinguish for different ranges for Capitol One
    multipleProductsFlag: DataTypes.INTEGER, // NOTE: ﻿Merilytics: Currently the flag is used for distinguishing multiple products for Wells fargo, Discover and Us Bank
    // creditorCheck1: DataTypes.STRING,

    /// ﻿Fund Accumulation
    endOfCurrentMonth: DataTypes.FLOAT,
    monthOut1: DataTypes.FLOAT,
    monthOut2: DataTypes.FLOAT,
    monthOut3: DataTypes.FLOAT,
    monthOut4: DataTypes.FLOAT,
    monthOut5: DataTypes.FLOAT,
    monthOut6: DataTypes.FLOAT,
    monthOut7: DataTypes.FLOAT,
    monthOut8: DataTypes.FLOAT,
    monthOut9: DataTypes.FLOAT,
    monthOut10: DataTypes.FLOAT,
    monthOut11: DataTypes.FLOAT,
    monthOut12: DataTypes.FLOAT,
    maxTermOut: DataTypes.FLOAT,

    minOfFunds: DataTypes.FLOAT,
    lessThen5PctSettlementFlag: DataTypes.INTEGER, // NOTE: ﻿Merilytics: Flag to exclude the payments having less than 5% of the settlement

    notSettlePreChargeOffFlag: DataTypes.INTEGER, // NOTE: ﻿Merilytics: Flag to exclude the creditors who don't settle pre charge off

    creditorScore: DataTypes.INTEGER,
    delinquencyFlag: DataTypes.INTEGER, // NOTE: ﻿﻿Merilytics: Flag to exclude accounts with less than 100 days of delinquency and having creditor score less than 7

    /// ﻿Eligibility for settlement
    isEligible: DataTypes.STRING,

    /// Creditors tab ==> (will be calculated on the fly)

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
    minCheck: DataTypes.INTEGER, // NOTE: ﻿Merilytics: If the minimum check <0, then a term payment will be NSF
    termConsidered: DataTypes.INTEGER,

    settlementAmountAsPctOfVerifiedDebt: DataTypes.FLOAT,
    feePct: DataTypes.FLOAT,
    feeAmount: DataTypes.FLOAT
});

  // Account.associate = (models) => {
  //
  //   models.Account.belongsTo(models.Creditor, {
  //     onDelete: 'CASCADE',
  //     foreignKey: {
  //       name: 'creditorId',
  //       allowNull: false,
  //     },
  //   });
  //
  //   models.Account.belongsTo(models.State, {
  //     onDelete: 'CASCADE',
  //     foreignKey: {
  //       name: 'enrolledStateId',
  //       allowNull: false,
  //     },
  //   });
  //
  //   models.Account.belongsTo(models.AccountStatus, {
  //     onDelete: 'CASCADE',
  //     foreignKey: {
  //       name: 'currentAccountStatusId',
  //       allowNull: false,
  //     },
  //   });
  //
  // };

  return Account;
};
