const models = require('../../models/index');
const calculationsHelper = require('./calculationsHelper');
const eligibleAccountsFilter = require('./eligibleAccountsFilter');

const scorecardCalculations = {

  // / External Interface ----------------------------------------------------------------------------------------------

  setData: () => {
    const init = Promise.all([
      scorecardCalculations.importActiveAccounts(),
      scorecardCalculations.importStates(),
      scorecardCalculations.importMonthlyProgramPaymentRanges(),
      scorecardCalculations.importAccountDelinquencyRanges(),
      scorecardCalculations.importAvgAcceptedSettlementRanges(),
      scorecardCalculations.importSettlementTermRanges(),
      scorecardCalculations.importAccountStatusValues(),
      scorecardCalculations.importEnrollDebtRanges(),
      scorecardCalculations.importFeeEstimateRanges(),
      scorecardCalculations.importFirstMonthFeeFundPctRanges(),
      scorecardCalculations.importWeightageFactors(),
    ]);

    return new Promise((resolve, reject) => init.then(() => {
      const accounts = scorecardCalculations._accounts;

      calculationsHelper.calculateAllRows(scorecardCalculations, 'Scorecard', models.ScorecardRecord, accounts, 'create')
        // .then(() => eligibleAccountsFilter.filter()) //filters the scorecard to contain only 1. max score per program 2. eligible programs
        .then(() => resolve('Scorecard Calculations Success! :)'))
        .then(async () => {
          await scorecardCalculations.fillTradeLineState();
          resolve('Tradeline state data imported');
        })
        .catch(() => resolve('Scorecard Calculations Error! :('));
    }));
  },

  // / Internal Service Functions ---------------------------------------------------------

  importActiveAccounts: () => new Promise(resolve => models.ImportedActiveAccount.findAll({
    raw: true,
  }).then((results) => {
    scorecardCalculations._accounts = results;
    resolve();
  })),

  importStates: () => new Promise(resolve => models.StatePointsDef.findAll().then((results) => {
    scorecardCalculations._states = results;
    resolve();
  })),

  importMonthlyProgramPaymentRanges: () => new Promise(resolve => models.MonthlyProgramPaymentPointsDef.findAll().then((results) => {
    scorecardCalculations._monthlyProgramPaymentRanges = results;
    resolve();
  })),

  importAccountDelinquencyRanges: () => new Promise(resolve => models.AccountDelinquencyPointsDef.findAll().then((results) => {
    scorecardCalculations._accountDelinquencyRanges = results;
    resolve();
  })),

  importAvgAcceptedSettlementRanges: () => new Promise(resolve => models.AvgAcceptedSettlementPointsDef.findAll().then((results) => {
    scorecardCalculations._avgAcceptedSettlementRanges = results;
    resolve();
  })),

  importSettlementTermRanges: () => new Promise(resolve => models.SettlementTermPointsDef.findAll().then((results) => {
    scorecardCalculations._settlementTermRanges = results;
    resolve();
  })),

  importAccountStatusValues: () => new Promise(resolve => models.AccountStatusPointsDef.findAll().then((results) => {
    scorecardCalculations._accountStatusValues = results;
    resolve();
  })),

  importEnrollDebtRanges: () => new Promise(resolve => models.EnrollDebtPointsDef.findAll().then((results) => {
    scorecardCalculations._enrollDebtRanges = results;
    resolve();
  })),

  importFeeEstimateRanges: () => new Promise(resolve => models.FeeEstimatePointsDef.findAll().then((results) => {
    scorecardCalculations._feeEstimateRanges = results;
    resolve();
  })),

  importFirstMonthFeeFundPctRanges: () => new Promise(resolve => models.FirstMonthFeeFundPctPointsDef.findAll().then((results) => {
    scorecardCalculations._firstMonthFeeFundPctRanges = results;
    resolve();
  })),

  importWeightageFactors: () => new Promise(resolve => models.WeightDef.findAll().then((results) => {
    scorecardCalculations._weightageFactors = results;
    resolve();
  })),

  accountColumnImport: (account, accountColumnName, fallbackValue) => new Promise((resolve) => {
    resolve(account[accountColumnName] || fallbackValue);
  }),

  calculateWeightageColumn: (account, columnName, columnLabel) => new Promise((resolve) => {
    let result;

    scorecardCalculations.columns[columnName](account).then((columnValue) => {
      const weightageFactor = scorecardCalculations._weightageFactors.filter(wf => wf.criteria === columnLabel)[0];

      try {
        result = weightageFactor.weightage * columnValue;
      } catch (ex) {
        result = 0;
      }

      resolve(result);
    });
  }),

  fillTradeLineState: () => {
    new Promise(resolve => models.sequelize
      .query('INSERT INTO "public"."TradelinesStates" ( "createdAt", "updatedAt", "tradeLineId") SELECT "createdAt","updatedAt","tradeLineId" FROM "public"."ScorecardRecords" WHERE "tradeLineId" NOT IN ( SELECT "tradeLineId" FROM  "public"."TradelinesStates");')
      .then(() => {
        resolve();
      }));
  },

  columns: {

    // / Metadata
    tradeLineId: async (account) => {
      const tradeLineName = await scorecardCalculations.accountColumnImport(account, 'tradelinename');
      return parseInt(tradeLineName.replace(/[^\d.]/g, ''));
    },
    tradeLineName: account => scorecardCalculations.accountColumnImport(account, 'tradelinename'),
    programName: account => scorecardCalculations.accountColumnImport(account, 'programname'),
    creditor: account => scorecardCalculations.accountColumnImport(account, 'creditor'),
    eligibility: account => scorecardCalculations.accountColumnImport(account, 'eligibility'),

    balance: account => scorecardCalculations.accountColumnImport(account, 'balance'),
    endOfCurrentMonthFundAccumulation: account => scorecardCalculations.accountColumnImport(account, 'm0_bal'),
    lastWorkedOn: account => scorecardCalculations.accountColumnImport(account, 'tradeline_last_negotiated'),
    creditorTerms: account => scorecardCalculations.accountColumnImport(account, 'creditor_terms'),

    // / Metrics
    metrics_creditorScore: account => scorecardCalculations.accountColumnImport(account, 'credit_score'),
    metrics_stateOfResidency: account => scorecardCalculations.accountColumnImport(account, 'state_of_residency'),
    metrics_monthlyPayment: account => scorecardCalculations.accountColumnImport(account, 'avg_monthly_payment'),
    metrics_accountDelinquency: account => scorecardCalculations.accountColumnImport(account, 'account_delinquency'),
    metrics_pctAvgSettlement: account => scorecardCalculations.accountColumnImport(account, 'accepted_ratio'),
    metrics_settlementTerm: account => scorecardCalculations.accountColumnImport(account, 'accepted_terms'),
    metrics_accountStatus: account => scorecardCalculations.accountColumnImport(account, 'account_status'),
    metrics_enrolledDebt: account => scorecardCalculations.accountColumnImport(account, 'enrolled_debt'),
    metrics_firstMonthFeeFundPct: account => scorecardCalculations.accountColumnImport(account, 'fee_funded_pct'),
    metrics_feeEstimate: account => scorecardCalculations.accountColumnImport(account, 'fee'),

    // / Assigned Points
    points_creditorScore: account => scorecardCalculations.columns.metrics_creditorScore(account),
    points_stateOfResidency: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_stateOfResidency(account).then((metrics_stateOfResidency) => {
        const state = scorecardCalculations._states.filter(st => st.code === metrics_stateOfResidency)[0];

        try {
          result = state.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_monthlyPayment: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_monthlyPayment(account).then((metrics_monthlyPayment) => {
        try {
          const range = scorecardCalculations._monthlyProgramPaymentRanges.filter(a => metrics_monthlyPayment >= a.rangeFrom && metrics_monthlyPayment <= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_accountDelinquency: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_accountDelinquency(account).then((metrics_accountDelinquency) => {
        try {
          const range = scorecardCalculations._accountDelinquencyRanges.filter(a => metrics_accountDelinquency >= a.rangeFrom && metrics_accountDelinquency <= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_pctAvgSettlement: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_pctAvgSettlement(account).then((metrics_pctAvgSettlement) => {
        try {
          const range = scorecardCalculations._avgAcceptedSettlementRanges.filter(a => metrics_pctAvgSettlement >= a.rangeFrom && metrics_pctAvgSettlement <= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_settlementTerm: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_settlementTerm(account).then((metrics_settlementTerm) => {
        try {
          const range = scorecardCalculations._settlementTermRanges.filter(a => metrics_settlementTerm <= a.rangeFrom && metrics_settlementTerm >= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_accountStatus: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_accountStatus(account).then((metrics_accountStatus) => {
        try {
          const accountStatus = scorecardCalculations._accountStatusValues.filter(a => a.name.toLowerCase() === (metrics_accountStatus || '').toLowerCase())[0];

          result = accountStatus.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_enrolledDebt: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_enrolledDebt(account).then((metrics_enrolledDebt) => {
        try {
          const range = scorecardCalculations._enrollDebtRanges.filter(a => metrics_enrolledDebt >= a.rangeFrom && metrics_enrolledDebt <= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_firstMonthFeeFundPct: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_firstMonthFeeFundPct(account).then((metrics_firstMonthFeeFundPct) => {
        try {
          const range = scorecardCalculations._firstMonthFeeFundPctRanges.filter(a => metrics_firstMonthFeeFundPct >= a.rangeFrom && metrics_firstMonthFeeFundPct <= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),
    points_feeEstimate: account => new Promise((resolve) => {
      let result;

      scorecardCalculations.columns.metrics_feeEstimate(account).then((metrics_feeEstimate) => {
        try {
          const range = scorecardCalculations._feeEstimateRanges.filter(a => metrics_feeEstimate >= a.rangeFrom && metrics_feeEstimate <= a.rangeTo)[0];

          result = range.points;
        } catch (ex) {
          result = null;
        }

        resolve(result);
      });
    }),

    // / ﻿Weighted Score
    weight_creditorScore: account => scorecardCalculations.calculateWeightageColumn(account, 'points_creditorScore', 'Creditor score'),
    weight_stateOfResidency: account => scorecardCalculations.calculateWeightageColumn(account, 'points_stateOfResidency', 'State of residency'),
    weight_monthlyPayment: account => scorecardCalculations.calculateWeightageColumn(account, 'points_monthlyPayment', 'Monthly payment'),
    weight_accountDelinquency: account => scorecardCalculations.calculateWeightageColumn(account, 'points_accountDelinquency', 'Account delinquency'),
    weight_pctAvgSettlement: account => scorecardCalculations.calculateWeightageColumn(account, 'points_pctAvgSettlement', '% Avg settlement'),
    weight_settlementTerm: account => scorecardCalculations.calculateWeightageColumn(account, 'points_settlementTerm', 'Settlement term'),
    weight_accountStatus: account => scorecardCalculations.calculateWeightageColumn(account, 'points_accountStatus', 'Account status'),
    weight_enrolledDebt: account => scorecardCalculations.calculateWeightageColumn(account, 'points_enrolledDebt', 'Enrolled debt'),
    weight_firstMonthFeeFundPct: account => scorecardCalculations.calculateWeightageColumn(account, 'points_firstMonthFeeFundPct', 'First Month Fee Funding Pct'),
    weight_feeEstimate: account => scorecardCalculations.calculateWeightageColumn(account, 'points_feeEstimate', 'Fee Estimate'),

    // / Summary
    totalScore: account => new Promise((resolve) => {
      let result = 0;
      const promises = [
        scorecardCalculations.columns.weight_creditorScore(account),
        scorecardCalculations.columns.weight_stateOfResidency(account),
        scorecardCalculations.columns.weight_monthlyPayment(account),
        scorecardCalculations.columns.weight_accountDelinquency(account),
        scorecardCalculations.columns.weight_pctAvgSettlement(account),
        scorecardCalculations.columns.weight_firstMonthFeeFundPct(account),
        scorecardCalculations.columns.weight_feeEstimate(account),
        scorecardCalculations.columns.weight_settlementTerm(account),
        scorecardCalculations.columns.weight_accountStatus(account),
        scorecardCalculations.columns.weight_enrolledDebt(account),
      ];

      Promise.all(promises).then((results) => {
        results.forEach((r) => {
          result += r;
        });
        resolve(result);
      });
    }),
    // rank: DataTypes.INTEGER,

  },
};

module.exports = scorecardCalculations;
